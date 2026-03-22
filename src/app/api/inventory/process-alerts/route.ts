import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Institutional Sentinel - Alert Processing Core
 * Manually triggered by "Sync Nodes" or external cron job.
 * Handles overdue checkouts and 48hr missing escalation.
 */
export async function POST() {
  try {
    const alertsCreated = [];
    const now = new Date().toISOString();
    const missingThreshold = new Date(Date.now() - 172800000).toISOString(); // 48 Hours

    // 1. Process Overdue Checkouts
    const { data: overdueCheckouts } = await supabase
      .from('inventory_checkouts')
      .select('*, inventory(name, tag_id)')
      .eq('status', 'ACTIVE')
      .lt('due_at', now);

    if (overdueCheckouts && overdueCheckouts.length > 0) {
      for (const co of overdueCheckouts) {
        // Mark unit as overdue
        await supabase.from('inventory').update({ overdue: true }).eq('id', co.item_id);

        // Check for existing unresolved alert
        const { data: existing } = await supabase.from('inventory_alerts')
           .select('id').eq('item_id', co.item_id).eq('type', 'OVERDUE').eq('status', 'UNRESOLVED').single();

        if (!existing) {
          const { data: alert } = await supabase.from('inventory_alerts').insert({
            item_id: co.item_id,
            type: 'OVERDUE',
            details: `Asset overstayed session window. Due: ${new Date(co.due_at).toLocaleTimeString()}`
          }).select().single();
          alertsCreated.push(alert);
        }
      }
    }

    // 2. Process Missing Equipment (No scan for 48 hours)
    const { data: missingUnits } = await supabase
      .from('inventory')
      .select('id, name, tag_id')
      .eq('status', 'USING')
      .lt('last_seen', missingThreshold);

    if (missingUnits && missingUnits.length > 0) {
      for (const unit of missingUnits) {
        // Escalate status to MISSING
        await supabase.from('inventory').update({ status: 'MISSING' }).eq('id', unit.id);

        // Create Missing alert
        const { data: existing } = await supabase.from('inventory_alerts')
           .select('id').eq('item_id', unit.id).eq('type', 'MISSING').eq('status', 'UNRESOLVED').single();

        if (!existing) {
          const { data: alert } = await supabase.from('inventory_alerts').insert({
            item_id: unit.id,
            type: 'MISSING',
            details: `Institutional Signal Lost over 48hr threshold. Unit Escalated.`
          }).select().single();
          alertsCreated.push(alert);
        }
      }
    }

    return NextResponse.json({
       success: true,
       alerts_processed: overdueCheckouts?.length || 0,
       missing_escalations: missingUnits?.length || 0,
       new_alerts_triggered: alertsCreated.length,
       timestamp: now
    });

  } catch (err) {
    console.error("Sentinel Process Error:", err);
    return NextResponse.json({ error: 'Sentinel Autonomy Core Failure' }, { status: 500 });
  }
}
