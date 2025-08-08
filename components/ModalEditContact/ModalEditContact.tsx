"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const formSchema = z.object({
	email: z.string().email("Invalid email address"),
	phone_number: z
		.string()
		.regex(/^\d+$/, "Phone number must be numbers only")
		.max(14, "Phone number must be at most 14 digits"),
	location: z.string().min(1, "Location is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface ModalEditContactProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	user?: {
		email?: string;
		phone_number?: string;
		location?: string;
	};
	setUser?: (user: any) => void;
}

export default function ModalEditContact({
	open,
	setOpen,
	user,
	setUser,
}: ModalEditContactProps) {
	const [loading, setLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			phone_number: "",
			location: "",
		},
		mode: "onChange",
	});

	useEffect(() => {
		if (user) {
			reset({
				email: user.email || "",
				phone_number: user.phone_number || "",
				location: user.location || "",
			});
		}
	}, [user, reset]);

	const onSubmit = async (data: FormValues) => {
		try {
			setLoading(true);

			const res = await fetch("/api/profile", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const result = await res.json();

			if (!res.ok) {
				throw new Error(result.error || "Failed to update profile");
			}

			const profileRes = await fetch("/api/profile");
			if (profileRes.ok) {
				const profileData = await profileRes.json();
				setUser?.(profileData);
			}

			toast.success("Profile updated successfully");
			setOpen(false);
		} catch (error: any) {
			toast.error(error.message || "Failed to update profile");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Contact Info</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative">
					<div>
						<label className="block text-sm font-medium mb-2">Email</label>
						<Input type="email" {...register("email")} />
						{errors.email && (
							<p className="text-red-500 text-sm">{errors.email.message}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">Phone Number</label>
						<Input type="text" {...register("phone_number")} />
						{errors.phone_number && (
							<p className="text-red-500 text-sm">
								{errors.phone_number.message}
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">Location</label>
						<Input id="location-input" {...register("location")} />
						{errors.location && (
							<p className="text-red-500 text-sm">{errors.location.message}</p>
						)}
					</div>

					<div className="flex w-full justify-between mt-12">
						<Button
							type="button"
							onClick={() => setOpen(false)}
							className="w-[48%] bg-red-500 hover:bg-red-400"
						>
							Cancel
						</Button>
						<Button
							className="w-[48%] bg-blue-600 hover:bg-blue-500"
							type="submit"
							disabled={loading}
						>
							{loading ? "Saving..." : "Save"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
