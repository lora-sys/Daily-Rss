import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();
  console.log(email); //xxx@qq.com
  // save to contact List
  const resend = new Resend(process.env.RESEND_API_KEY);
  // create a acounnt
  const { error: CreateError } = await resend.contacts.create({
    email: email,
  });
  if (CreateError) {
    console.log(CreateError);
    return NextResponse.json({ error: CreateError.message }, { status: 500 });
  }
  //  add acount to contact List
  const { error: AddError } = await resend.contacts.segments.add({
    email: email,
    segmentId: "d7d093bd-99af-4ef9-b076-15b9999d105c",
  });
  if (AddError) {
    console.log(AddError);
    return NextResponse.json({ error: AddError.message }, { status: 500 });
  }
  // Add your subscription logic here
  return NextResponse.json("Subscribed", { status: 200 });
}
