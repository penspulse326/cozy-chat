import ClientPage from './client-page';

async function getTrends() {
  const res = await fetch(
    'https://raw.githubusercontent.com/penspulse326/google-trends/refs/heads/main/data.json',
    {
      next: {
        revalidate: 1800,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch trends');
  }

  return res.json();
}

export default async function Home() {
  const data = await getTrends();

  return <ClientPage trends={data.trends} />;
}
