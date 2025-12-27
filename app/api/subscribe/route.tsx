export async function POST(request: Request) {
  const { email } = await request.json();
  console.log(email);

  // Add your subscription logic here
  return new Response("Subscribed", { status: 200 });
}
