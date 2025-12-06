import { supabase } from './supabaseClient';

export const otpService = {
  // Generate and send OTP
  async sendOTP(phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database
      const { error } = await supabase
        .from('users')
        .update({
          verification_otp: otp,
          otp_expires_at: expiresAt.toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // In production, integrate with SMS service (Twilio, MSG91, etc.)
      // For now, just console log
      console.log(`OTP for ${phone}: ${otp}`);
      alert(`Development Mode: Your OTP is ${otp}`);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Verify OTP
  async verifyOTP(otp: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .select('verification_otp, otp_expires_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (!data.verification_otp) {
        throw new Error('No OTP found. Please request a new one.');
      }

      if (new Date(data.otp_expires_at) < new Date()) {
        throw new Error('OTP has expired. Please request a new one.');
      }

      if (data.verification_otp !== otp) {
        throw new Error('Invalid OTP');
      }

      // Mark phone as verified
      const { error: updateError } = await supabase
        .from('users')
        .update({
          phone_verified: true,
          verification_otp: null,
          otp_expires_at: null
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Check if phone is verified
  async isPhoneVerified(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('users')
        .select('phone_verified')
        .eq('id', user.id)
        .single();

      if (error) return false;
      return data.phone_verified || false;
    } catch {
      return false;
    }
  }
};
