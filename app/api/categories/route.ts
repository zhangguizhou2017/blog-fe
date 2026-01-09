import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      return NextResponse.json(
        { code: 400, error_code: "query_failed", msg: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      code: 200,
      data,
      msg: "获取分类列表成功",
    })
  } catch (err: any) {
    return NextResponse.json(
      { code: 500, error_code: "server_error", msg: err.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { code: 400, error_code: "validation_failed", msg: "分类名称不能为空" },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // 生成 slug
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "")

    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          name: name.trim(),
          description: description || null,
          slug,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json(
        { code: 400, error_code: "insert_failed", msg: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        code: 200,
        data: data[0],
        msg: "分类创建成功",
      },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { code: 500, error_code: "server_error", msg: err.message },
      { status: 500 }
    )
  }
}
