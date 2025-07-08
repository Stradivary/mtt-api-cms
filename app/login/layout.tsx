export default function LoginLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center">
			<div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
				{children}
			</div>
		</div>
	);
}
