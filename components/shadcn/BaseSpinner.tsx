 
 
 export default function BaseSpinner({ className }: { className?: string }) {
    return (
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 animate-spin border-r-transparent" />
    )
}