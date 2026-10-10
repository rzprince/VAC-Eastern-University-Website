import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { createMembershipPdf } from "@/lib/application-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Temporary synthetic smoke test. Removed before merging to production.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const long = params.get("long") === "1";
  try {
    const pdf = await createMembershipPdf({
      applicationRef: "VAC-DEMO-2026",
      fullName: "Example Creative Member",
      euId: "000000000",
      department: "CSE",
      address: "Eastern University, Dhaka, Bangladesh",
      dateOfBirth: "2000-05-22",
      bloodGroup: "B-",
      email: "example@example.com",
      phone: "01700000000",
      skills: long ? "Photography, videography, filmmaking, editing, storytelling, visual composition. ".repeat(9) : "Photography, videography, filming, color grading, editing and storytelling.",
      reason: long ? "I want to learn from creative people, collaborate with the club, and tell meaningful stories with images, film, and digital art. ".repeat(12) : "I want to learn from creative people, collaborate with the club, and tell meaningful stories with images, film, and digital art.",
      bkashSender: "01700000000",
      registrationFee: 150,
      submittedAt: "10 Oct 2026"
    });
    const loaded = await PDFDocument.load(pdf);
    if (params.get("format") === "pdf") {
      return new Response(pdf as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'inline; filename="VAC-PDF-Test.pdf"',
          "X-PDF-Pages": String(loaded.getPageCount())
        }
      });
    }
    return NextResponse.json({
      generated: true,
      pages: loaded.getPageCount(),
      bytes: pdf.byteLength,
      imageCount: loaded.context.enumerateIndirectObjects().filter(([_, value]) =>
        String(value).includes("/Image")
      ).length
    });
  } catch (error) {
    return NextResponse.json({generated: false, error: error instanceof Error ? error.message : "Unknown PDF error"}, {status:500});
  }
}
