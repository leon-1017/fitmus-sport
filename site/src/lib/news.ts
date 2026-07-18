export function sortPostsByDate<T extends { data: { date?: string } }>(posts: T[]) {
	return [...posts].sort((a, b) => {
		const dateA = a.data.date ? new Date(a.data.date).getTime() : 0;
		const dateB = b.data.date ? new Date(b.data.date).getTime() : 0;
		return dateB - dateA;
	});
}

export function formatPostDate(date?: string) {
	if (!date) return '';
	const parsed = new Date(date);
	return Number.isNaN(parsed.getTime())
		? date
		: parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
