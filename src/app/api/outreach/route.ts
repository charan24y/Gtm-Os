import { NextRequest, NextResponse } from "next/server";
import { Prospect, ProductDna } from "@/lib/demo-data";
import { resendProvider } from "@/lib/providers/resend";

export async function POST(req: NextRequest) {
  try {
    const {
      prospect,
      productDna,
      recipientOverride,
      action = "generate",
      emailSubject,
      emailBody,
    } = (await req.json()) as {
      prospect: Prospect;
      productDna: ProductDna;
      recipientOverride?: string;
      action?: "generate" | "send";
      emailSubject?: string;
      emailBody?: string;
    };

    if (!prospect || !productDna) {
      return NextResponse.json({ error: "Prospect and Product DNA are required" }, { status: 400 });
    }

    // Action 1: Generate personalized outreach email referencing verifiable TinyFish evidence
    if (action === "generate") {
      const subject = `Quick question regarding ${prospect.company_or_channel || prospect.name}'s workflow`;
      const body = `Hi ${prospect.name.split(" ")[0]},\n\nI noticed on ${prospect.evidence_url} that you recently mentioned: "${prospect.evidence_quote_or_observation.slice(0, 90)}..."\n\nWe built ${productDna.productName} specifically to solve this—${productDna.valueProp.toLowerCase()}\n\nWould it be helpful if I showed you how other teams in ${productDna.icpSegments[0] || "your space"} automate this?\n\nBest,\nFounding Team @ ${productDna.productName}`;

      const personalizationAngle = `Directly hooks into verified public evidence from ${prospect.timestamp} on ${new URL(prospect.evidence_url).hostname}. Demonstrates immediate contextual relevance rather than a generic spam blast.`;

      return NextResponse.json({
        success: true,
        subject,
        body,
        personalizationAngle,
      });
    }

    // Action 2: Send email via Resend API
    if (action === "send") {
      const targetEmail = recipientOverride || prospect.contact_email;
      if (!targetEmail || targetEmail === "Not Publicly Listed") {
        return NextResponse.json(
          { error: "No valid recipient email provided. Please enter an email in the override box." },
          { status: 400 }
        );
      }

      const resendResult = await resendProvider.sendEmail({
        to: targetEmail,
        subject: emailSubject || `Outreach from ${productDna.productName}`,
        html: `<p>${(emailBody || "").replace(/\n/g, "<br/>")}</p><hr/><small style="color: #777;">Verified Evidence Source: <a href="${prospect.evidence_url}">${prospect.evidence_url}</a></small>`,
      });

      if (!resendResult.success) {
        return NextResponse.json(
          { success: false, error: resendResult.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        deliveryId: resendResult.messageId,
        sentTo: resendResult.sentTo || targetEmail,
        note: resendResult.note,
        message: resendResult.note || `Live email dispatched to ${resendResult.sentTo || targetEmail} via Resend.`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Outreach failed";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
