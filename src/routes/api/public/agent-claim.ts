import { createFileRoute } from "@tanstack/react-router";
import { redeemClaimCode } from "@/lib/game.functions";

/**
 * Called by the user's AI agent: trades a single-use on-site claim code plus the
 * agent's own wallet address for claimGameVoucher calldata. Public by design —
 * the code itself (15 min, single use) and the on-chain Agent ID check are the guards.
 */
export const Route = createFileRoute("/api/public/agent-claim")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { code?: unknown; wallet?: unknown };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ ok: false, error: "Send JSON: {\"code\":\"CATCH-…\",\"wallet\":\"0x…\"}" }, { status: 400 });
        }
        if (typeof body.code !== "string" || typeof body.wallet !== "string" || body.code.length > 40)
          return Response.json({ ok: false, error: "code and wallet are required" }, { status: 400 });
        const r = await redeemClaimCode(body.code, body.wallet);
        if (!r.ok) return Response.json(r, { status: 400 });
        if (!r.inputData) return Response.json({ ok: false, error: "Live claims are not switched on.", errorZh: "真实领取尚未开启。" }, { status: 503 });
        const cli = `baw contract-call preview --binanceChainId ${r.chainId} --from ${r.voucher.to} --to ${r.contract} --value 0 --inputData ${r.inputData} --json`;
        return Response.json({
          ok: true,
          chainId: r.chainId,
          from: r.voucher.to,
          to: r.contract,
          value: "0",
          inputData: r.inputData,
          symbol: r.spawn.symbol,
          amount: r.spawn.amount,
          place: r.spawn.place,
          deadline: r.voucher.deadline,
          next: cli,
        });
      },
    },
  },
});
