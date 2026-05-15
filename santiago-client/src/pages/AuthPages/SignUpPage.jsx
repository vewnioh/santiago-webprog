import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { createUser } from '../../services/UserService';

const inputClasses =
  'w-full rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-sm text-white placeholder:text-neutral-600 outline-none transition-all duration-200 focus:border-amber-400/60 focus:bg-neutral-900 focus:shadow-[0_0_0_4px_rgba(251,191,36,0.08)]';

const labelClasses = 'font-mono text-[10px] uppercase tracking-[0.28em] text-neutral-500';
const errorClasses = 'text-[11px] text-red-400 mt-1';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    contactNumber: '',
    email: '',
    username: '',
    password: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    const fields = [
      ['firstName', 'First name'],
      ['lastName', 'Last name'],
      ['age', 'Age'],
      ['gender', 'Gender'],
      ['contactNumber', 'Contact number'],
      ['email', 'Email'],
      ['username', 'Username'],
      ['password', 'Password'],
      ['address', 'Address'],
    ];
    fields.forEach(([key, label]) => {
      if (!form[key].trim()) next[key] = `${label} is required.`;
    });
    if (!next.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address.';
    }
    if (!next.username && /\s/.test(form.username)) {
      next.username = 'Username must not contain spaces.';
    }
    if (!next.password && form.password.length < 8) {
      next.password = 'Password must be at least 8 characters.';
    }
    if (!next.contactNumber && !/^\d{11}$/.test(form.contactNumber)) {
      next.contactNumber = 'Contact number must be exactly 11 digits.';
    }
    if (!next.age && !/^\d+$/.test(form.age)) {
      next.age = 'Age must be a number.';
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }

    setLoading(true);
    try {
      await createUser({
        ...form,
        type: 'viewer',
        isActive: true,
      });
      navigate('/auth/signin');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text', placeholder = '') => (
    <label className="flex flex-col gap-1">
      <span className={labelClasses}>{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        autoComplete={name}
        className={inputClasses}
        value={form[name]}
        onChange={handleChange}
      />
      {errors[name] && <span className={errorClasses}>{errors[name]}</span>}
    </label>
  );

  return (
    <div className="animate-fade-up">

      <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.35em] text-amber-400">
        Box Office · Ticket Issuance
      </p>

      <h1
        className="mb-4 text-4xl leading-[1.02] tracking-tight text-white sm:text-5xl"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Reserve your<br />
        <span className="italic text-amber-400/90">seat in the dark.</span>
      </h1>

      <p className="mb-6 max-w-sm text-sm leading-6 text-neutral-500">
        Claim your spot in the house. Fill in your details to join CineVault.
      </p>

      {apiError && (
        <div className="mb-5 rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
          {apiError}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>

        <div className="grid gap-4 sm:grid-cols-2">
          {field('firstName', 'First Name', 'text', 'Ingrid')}
          {field('lastName', 'Last Name', 'text', 'Bergman')}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {field('age', 'Age', 'text', '25')}
          <label className="flex flex-col gap-1">
            <span className={labelClasses}>Gender</span>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <span className={errorClasses}>{errors.gender}</span>}
          </label>
        </div>

        {field('contactNumber', 'Contact Number', 'text', '09XXXXXXXXX')}
        {field('email', 'Email', 'email', 'you@cinemagoer.com')}
        {field('username', 'Username', 'text', 'ingrid_b')}

        <label className="flex flex-col gap-1">
          <span className={labelClasses}>Password</span>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className={inputClasses}
            value={form.password}
            onChange={handleChange}
          />
          {errors.password
            ? <span className={errorClasses}>{errors.password}</span>
            : <span className="text-[11px] text-neutral-600">Minimum 8 characters.</span>}
        </label>

        {field('address', 'Address', 'text', '123 Cinema St., Manila')}

        <Button type="submit" variant="primary" className="mt-2 w-full !py-3" disabled={loading}>
          {loading ? 'Claiming ticket…' : 'Claim Your Ticket'}
        </Button>
      </form>

      <div className="mt-8 flex items-center gap-2 border-t border-neutral-900 pt-6">
        <p className="text-xs text-neutral-500">Already a member?</p>
        <Link
          to="/auth/signin"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400 transition-colors hover:text-amber-300"
        >
          Sign in →
        </Link>
      </div>

      <p className="mt-6 text-[11px] leading-5 text-neutral-600">
        By claiming your ticket, you agree to be kind about Shyamalan, refrain from
        spoiling endings, and never rate films you haven't finished.
      </p>
    </div>
  );
};

export default SignUpPage;
