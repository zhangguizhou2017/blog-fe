import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { code: 404, error_code: "not_found", msg: "分类不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      code: 200,
      data,
      msg: "获取分类成功",
    })
  } catch (err: any) {
    return NextResponse.json(
      { code: 500, error_code: "server_error", msg: err.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      .update({
        name: name.trim(),
        description: description || null,
        slug,
      })
      .eq("id", params.id)
      .select()

    if (error) {
      return NextResponse.json(
        { code: 400, error_code: "update_failed", msg: error.message },
        { status: 400 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { code: 404, error_code: "not_found", msg: "分类不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      code: 200,
      data: data[0],
      msg: "分类更新成功",
    })
  } catch (err: any) {
    return NextResponse.json(
      { code: 500, error_code: "server_error", msg: err.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", params.id)

    if (error) {
      return NextResponse.json(
        { code: 400, error_code: "delete_failed", msg: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      code: 200,
      msg: "分类删除成功",
    })
  } catch (err: any) {
    return NextResponse.json(
      { code: 500, error_code: "server_error", msg: err.message },
      { status: 500 }
    )
  }
}
