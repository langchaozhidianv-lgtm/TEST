import { NextResponse } from "next/server";

export function ok<T>(data: T) {
  return NextResponse.json({
    code: 0,
    message: "ok",
    data
  });
}

export function notFound(message = "not found") {
  return NextResponse.json(
    {
      code: 404,
      message,
      data: null
    },
    { status: 404 }
  );
}
