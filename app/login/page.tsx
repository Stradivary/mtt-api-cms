'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { toast } from 'sonner';
import { loginSchema, LoginFormData } from '../schemas/loginSchema';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
	const router = useRouter();
	const [showPass, setShowPass] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		mode: 'onChange',
	});

	const onSubmit = async (data: LoginFormData) => {
		const res = await fetch('/api/login', {
			method: 'POST',
			body: JSON.stringify(data),
			headers: { 'Content-Type': 'application/json' },
		});

		if (res.ok) {
			toast.success('Login berhasil!');
			location.href = '/dashboard/news';
		} else {
			const err = await res.json();
			toast.error(err.message || 'Login gagal');
		}
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="w-full max-w-sm rounded space-y-6"
		>
			<div className="flex justify-center">
				<Image
					src="/images/logo-login.png"
					alt="Logo"
					width={140}
					height={140}
					className="rounded-full"
				/>
			</div>
			<div>
				<label className="block text-sm font-medium">Email</label>
				<input
					type="email"
					{...register('email')}
					className="w-full border rounded px-3 py-2 mt-1"
				/>
				{errors.email && (
					<p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
				)}
			</div>
			<div className="relative">
				<label className="block text-sm font-medium">Password</label>
				<input
					type={showPass ? 'text' : 'password'}
					{...register('password')}
					className="w-full border rounded px-3 py-2 mt-1 pr-10"
				/>
				<button
					type="button"
					onClick={() => setShowPass(!showPass)}
					className="absolute right-3 top-9 text-gray-600 hover:text-gray-800"
				>
					{showPass ? <EyeOff size={20} /> : <Eye size={20} />}
				</button>
				{errors.password && (
					<p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
				)}
			</div>
			<div className="text-right">
				<a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
					Forgot Password?
				</a>
			</div>
			<div className="pt-4">
				<button
					type="submit"
					disabled={!isValid || isSubmitting}
					className={`w-full py-2 rounded text-white ${
						!isValid || isSubmitting
							? 'bg-gray-400 cursor-not-allowed'
							: 'bg-indigo-600 hover:bg-indigo-700'
					}`}
				>
					{isSubmitting ? 'Loading...' : 'Login'}
				</button>
			</div>
		</form>
	);
}
