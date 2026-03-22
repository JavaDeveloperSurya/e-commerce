const loginPage = {
  state: {
    step: 'email',
    email: '',
    loginToken: localStorage.getItem('loginToken') || ''
  },

  init() {
    uiService.initLayout();
    this.cacheDom();
    this.bindEvents();
    this.restorePendingOtpState();
  },

  cacheDom() {
    this.form = document.getElementById('loginForm');
    this.emailInput = document.getElementById('emailInput');
    this.otpInput = document.getElementById('otpInput');
    this.otpSection = document.getElementById('otpSection');
    this.submitBtn = document.getElementById('loginSubmitBtn');
    this.changeEmailBtn = document.getElementById('changeEmailBtn');
    this.resendOtpBtn = document.getElementById('resendOtpBtn');
    this.stepBadge = document.getElementById('loginStepBadge');
    this.otpHint = document.getElementById('otpHint');
  },

  bindEvents() {
    this.form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (this.state.step === 'email') {
        await this.submitEmail();
        return;
      }
      await this.verifyOtp();
    });

    this.resendOtpBtn.addEventListener('click', async () => {
      await this.resendOtp();
    });

    this.changeEmailBtn.addEventListener('click', () => {
      this.resetToEmailStep();
    });

    this.otpInput.addEventListener('input', () => {
      this.otpInput.value = this.otpInput.value.replace(/\D/g, '').slice(0, 6);
    });
  },

  restorePendingOtpState() {
    if (!this.state.loginToken) return;
    this.state.step = 'otp';
    this.showOtpStep(localStorage.getItem('pendingLoginEmail') || '');
  },

  async submitEmail() {
    const email = this.emailInput.value.trim().toLowerCase();
    if (!email) {
      uiService.showToast('Please enter your email address', 'error');
      this.emailInput.focus();
      return;
    }

    uiService.showLoader();
    this.submitBtn.disabled = true;

    try {
      // API integration happens here: request OTP from the backend login route.
      const response = await authService.login(email);
      const loginToken = response.Token || response.token;
      if (!loginToken) {
        throw new Error('OTP token was not returned by the backend');
      }

      this.state.email = email;
      this.state.loginToken = loginToken;
      localStorage.setItem('loginToken', loginToken);
      localStorage.setItem('pendingLoginEmail', email);
      this.showOtpStep(email);
      uiService.showToast(response.message || 'OTP sent successfully', 'success');
    } catch (error) {
      uiService.showToast(error.message || 'Unable to send OTP', 'error');
    } finally {
      uiService.hideLoader();
      this.submitBtn.disabled = false;
    }
  },

  async verifyOtp() {
    const otp = this.otpInput.value.trim();
    if (otp.length !== 6) {
      uiService.showToast('Please enter the 6-digit OTP', 'error');
      this.otpInput.focus();
      return;
    }

    uiService.showLoader();
    this.submitBtn.disabled = true;

    try {
      // API integration happens here: verify the OTP with the backend verification route.
      const response = await authService.verifyOtp(this.state.loginToken, otp);
      authService.persistSession(response);
      localStorage.removeItem('loginToken');
      localStorage.removeItem('pendingLoginEmail');
      uiService.showToast(response.message || 'Authenticated successfully', 'success');
      this.redirectByRole();
    } catch (error) {
      const attemptsLeft = error.payload?.attemptsLeft;
      this.otpHint.textContent = typeof attemptsLeft === 'number'
        ? `Invalid OTP. Attempts left: ${attemptsLeft}`
        : (error.message || 'OTP verification failed');
      uiService.showToast(error.message || 'OTP verification failed', 'error');
    } finally {
      uiService.hideLoader();
      this.submitBtn.disabled = false;
    }
  },

  async resendOtp() {
    if (!this.state.loginToken) {
      uiService.showToast('Please submit your email again', 'error');
      return;
    }

    uiService.showLoader();
    this.resendOtpBtn.disabled = true;

    try {
      // API integration happens here: resend OTP using the backend resend route.
      const response = await authService.resendOtp(this.state.loginToken);
      uiService.showToast(response.message || 'OTP resent successfully', 'success');
      this.otpHint.textContent = 'A fresh OTP has been sent to your email.';
    } catch (error) {
      uiService.showToast(error.message || 'Unable to resend OTP', 'error');
    } finally {
      uiService.hideLoader();
      this.resendOtpBtn.disabled = false;
    }
  },

  showOtpStep(email) {
    this.state.step = 'otp';
    this.stepBadge.textContent = 'Step 2';
    this.submitBtn.textContent = 'Verify OTP';
    this.changeEmailBtn.classList.remove('d-none');
    this.otpSection.classList.remove('d-none');
    this.emailInput.value = email;
    this.emailInput.setAttribute('readonly', 'readonly');
    this.otpHint.textContent = email ? `OTP sent to ${email}. Enter the 6-digit code.` : 'Check your email inbox for the OTP.';
    this.otpInput.focus();
  },

  resetToEmailStep() {
    this.state.step = 'email';
    this.state.loginToken = '';
    localStorage.removeItem('loginToken');
    localStorage.removeItem('pendingLoginEmail');
    this.stepBadge.textContent = 'Step 1';
    this.submitBtn.textContent = 'Send OTP';
    this.changeEmailBtn.classList.add('d-none');
    this.otpSection.classList.add('d-none');
    this.emailInput.removeAttribute('readonly');
    this.otpInput.value = '';
    this.otpHint.textContent = 'Check your email inbox for the OTP.';
    this.emailInput.focus();
  },

  redirectByRole() {
    const user = authService.getCurrentUser();
    const redirects = {
      buyer: 'user-dashboard.html',
      seller: 'seller-dashboard.html',
      admin: 'admin-dashboard.html',
      superadmin: 'superadmin-dashboard.html'
    };
    setTimeout(() => {
      window.location.href = redirects[user?.role] || 'home.html';
    }, 900);
  }
};

document.addEventListener('DOMContentLoaded', () => loginPage.init());
