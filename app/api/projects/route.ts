import { ok } from "@/lib/api";
import { createProjectData, listProjectsData } from "@/lib/server-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword")?.trim().toLowerCase();
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 20);

  const projects = await listProjectsData();
  const filtered = projects.filter((project) => {
    if (keyword && !project.name.toLowerCase().includes(keyword)) {
      return false;
    }

    if (status && project.status !== status) {
      return false;
    }

    return true;
  });

  const start = (page - 1) * pageSize;

  return ok({
    list: filtered.slice(start, start + pageSize),
    page,
    pageSize,
    total: filtered.length
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  return ok(await createProjectData(body));
}
