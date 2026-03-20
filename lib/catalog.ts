import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Section, Jersey } from "@/lib/models";
import {
  toJerseyPublic,
  toSectionWithJerseysPublic,
  type JerseyPublic,
  type SectionWithJerseysPublic,
  type LeanJersey,
  type LeanSection,
} from "@/lib/catalog-shared";

export type { JerseyPublic, SectionWithJerseysPublic } from "@/lib/catalog-shared";

export async function getSectionsWithJerseys(): Promise<SectionWithJerseysPublic[]> {
  await connectDB();
  const sections = await Section.find().sort({ sortOrder: 1, name: 1 }).lean();
  const out: SectionWithJerseysPublic[] = [];
  for (const s of sections) {
    const jerseys = await Jersey.find({ sectionId: s._id })
      .sort({ createdAt: -1 })
      .lean();
    out.push(
      toSectionWithJerseysPublic(s as unknown as LeanSection, jerseys as unknown as LeanJersey[])
    );
  }
  return out;
}

export async function getFeaturedJerseys(): Promise<JerseyPublic[]> {
  await connectDB();
  const list = await Jersey.find({ featured: true })
    .sort({ updatedAt: -1 })
    .limit(24)
    .lean();
  return list.map((j) => toJerseyPublic(j as unknown as LeanJersey));
}

export async function getJerseyById(id: string): Promise<JerseyPublic | null> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const j = await Jersey.findById(id).lean();
  return j ? toJerseyPublic(j as unknown as LeanJersey) : null;
}

export async function getTrendingJerseys(): Promise<JerseyPublic[]> {
  const featured = await getFeaturedJerseys();
  if (featured.length > 0) return featured;
  await connectDB();
  const list = await Jersey.find().sort({ updatedAt: -1 }).limit(12).lean();
  return list.map((j) => toJerseyPublic(j as unknown as LeanJersey));
}
