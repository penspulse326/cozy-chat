async function getTrends() {
  const res = await fetch(
    'https://raw.githubusercontent.com/penspulse326/cozy-chat/refs/heads/google-trends/google-trends.json',
    {
      next: {
        revalidate: 3600, // 每小時重新驗證一次
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch trends');
  }

  return res.json();
}

export default async function TrendsPage() {
  const trends = await getTrends();

  return <pre>{JSON.stringify(trends, null, 2)}</pre>;
}
