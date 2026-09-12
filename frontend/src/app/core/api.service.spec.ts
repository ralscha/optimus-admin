import { TestBed } from "@angular/core/testing";
import { ApiError, ApiService } from "./api.service";

describe("API contract", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("sends JSON mutations with session credentials", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "tsk_1" }), { status: 201 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const api = TestBed.inject(ApiService);
    await expect(api.post("/tasks", { title: "Ship it" })).resolves.toEqual({
      id: "tsk_1",
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/tasks");
    expect(init.credentials).toBe("include");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("Content-Type")).toBe(
      "application/json",
    );
    expect(JSON.parse(init.body as string)).toEqual({ title: "Ship it" });
  });
  it("preserves backend errors and status codes for the UI", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ error: "administrator role required" }),
            { status: 403 },
          ),
        ),
    );
    await expect(
      TestBed.inject(ApiService).get("/users"),
    ).rejects.toMatchObject({
      name: "ApiError",
      message: "administrator role required",
      status: 403,
    });
  });
  it("handles empty delete responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );
    await expect(
      TestBed.inject(ApiService).delete("/tasks/tsk_1"),
    ).resolves.toBeUndefined();
  });
  it("handles a non-JSON proxy error without hiding its status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("unavailable", {
          status: 502,
          statusText: "Bad Gateway",
        }),
      ),
    );
    await expect(TestBed.inject(ApiService).get("/dashboard")).rejects.toEqual(
      new ApiError("Bad Gateway", 502),
    );
  });
});
