import ThemeRegistry from '@/components/foundation/ThemeRegistry'
import type React from "react";
import { Toaster } from "react-hot-toast";

export default function Layout(props: { children: React.ReactNode }) {
	return (
		<ThemeRegistry>
			<html lang="en">
				<body
					style={{
						height: "100dvh",
						width: "100dvw",
						margin: 0,
						padding: 0,
					}}
				>
					{props.children}

					<Toaster
						position="bottom-center"
						toastOptions={{
							duration: 3000,
						}}
					/>
				</body>
			</html>
		</ThemeRegistry>
	);
}
