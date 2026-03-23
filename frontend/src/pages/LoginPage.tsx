import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ButtonSpinner } from '@/components/Spinner';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const { login, verifyOtp, resendOtp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token } = await login(email);
      setOtpToken(token);
      setStep('otp');
      toast({ title: 'OTP Sent', description: 'Check your email for the verification code.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp(otpToken, otp);
      toast({ title: 'Welcome!', description: 'You have been logged in successfully.' });
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Verification Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp(otpToken);
      toast({ title: 'OTP Resent', description: 'New code sent to your email.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md mx-4">
        <div className="rounded-xl border bg-card p-8 shadow-elevated animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {step === 'email' ? 'Welcome to ShopEase' : 'Verify Your Email'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 'email' ? 'Enter your email to get started' : `We sent a code to ${email}`}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <ButtonSpinner />}
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <Label htmlFor="otp">Enter 6-digit OTP</Label>
                <div className="relative mt-1">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="pl-10 text-center text-lg tracking-[0.5em] font-mono"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading || otp.length < 6}>
                {loading && <ButtonSpinner />}
                Verify & Login
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => setStep('email')} className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Change email
                </button>
                <button type="button" onClick={handleResend} className="text-primary hover:underline">
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
