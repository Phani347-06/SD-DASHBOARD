-- Supabase Full Schema for LabIntelligence Secure Attendance Workflow

-- WARNING: This drops existing conflicting tables to rebuild the precise schema
DROP TABLE IF EXISTS public.attendance_logs CASCADE;
DROP TABLE IF EXISTS public.temp_qr_sessions CASCADE;
DROP TABLE IF EXISTS public.class_sessions CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;

-- 1. Students Table (Handles Login & Fingerprint)
CREATE TABLE public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Linked to auth.users.id
    roll_no VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    department VARCHAR(50),
    
    -- Zero-Trust Identity Anchors
    registered_device_fingerprint VARCHAR(255),
    current_session_token UUID, -- The temp_session_id for the current login
    last_ping TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Class Sessions (Overarching Session for the Lecture/Lab)
CREATE TABLE public.class_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id VARCHAR(50) NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' -- 'ACTIVE' or 'ENDED'
);

-- 3. Temp Sessions / Rolling QRs (The 10-minute active token)
CREATE TABLE public.temp_qr_sessions (
    temp_session_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_session_id UUID REFERENCES public.class_sessions(id) ON DELETE CASCADE,
    verification_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. Attendance Scans (The two-stage validation tracking table)
CREATE TABLE public.attendance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_session_id UUID REFERENCES public.class_sessions(id) ON DELETE CASCADE,
    temp_session_id UUID REFERENCES public.temp_qr_sessions(temp_session_id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Workflow Booleans
    stage_1_passed BOOLEAN DEFAULT FALSE,
    stage_2_passed BOOLEAN DEFAULT FALSE,
    device_fingerprint_match BOOLEAN DEFAULT FALSE,
    
    -- Final Output 'PENDING' / 'VERIFIED' / 'FAILED'
    final_status VARCHAR(20) DEFAULT 'PENDING'
);

-- Important Security Notes:
-- Enabling Row Level Security (RLS) policies 
-- could be added here to restrict API key access based on User Auth
