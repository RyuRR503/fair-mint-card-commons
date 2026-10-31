import { parseEther } from "viem";
import { FAGENT } from "./config";

function orderPrice(price: string) {
  if (!/^\d+(\.\d{1,18})?$/.test(price)) throw new Error("价格格式不正确");
  const wei = parseEther(price);
  if (wei <= 0n || wei > (1n << 96n) - 1n) throw new Error("价格超出合约范围");
  return wei;
}
export const commandHead = `你是我的币安 Agent 钱包助手。网络：BNB Chain，chainId=${FAGENT.chainId}。项目代币 CA：${FAGENT.token}。卡牌金库 Vault：${FAGENT.vault}。所有卡牌函数调用 Vault，不调用代币 CA 或工厂。先从已验证源码获取 ABI 并核对函数签名，读取最新状态并模拟交易；展示函数、参数、BNB 金额和 gas，等我确认后才发送。失败立即停止，不索要或导出私钥。`;
export function mintCommand(count: number) {
  if (!Number.isInteger(count) || count < 1 || count > 7) throw new Error("铸造数量须为 1–7");
  return `${commandHead}\n铸造 ${count} 张。先读 hasAgentId(我的地址)、mintsUsed(我的地址)、userMints()、mintPrice()，核对身份、终身 7 张名额、全系列 731500 张付费上限、余额和项目可交易状态。调用 mint(uint256 count)，参数 ${count}，value=${2000000000000000n * BigInt(count)} wei（${count * 0.002} BNB）。确认后发送，按 PaidMint 日志报告所有卡号与交易哈希。`;
}
export function buyCommand(id: number, price: string) {
  const wei = orderPrice(price);
  return `${commandHead}\n买入卡牌 ${id}。读取 listings(${id}) 和 ownerOf(${id})，确认仍有有效卖单。最高价 ${price} BNB（${wei} wei）。调用 buy(uint256[] tokenIds,uint256[] maxPrices)，参数 [${id}]、[${wei}]，value=${wei} wei。超过限价的卡会被跳过，剩余款退回；按 Sold 日志报告实际成交，若没有 Sold 日志不能称为买入成功。`;
}
export function batchBuyCommand(cards: { id: number; priceWei: string }[], maxBuy: number) {
  if (!Number.isInteger(maxBuy) || maxBuy < 1 || !cards.length || cards.length > maxBuy) throw new Error("买入数量超出限制");
  if (cards.some(c => !Number.isInteger(c.id) || c.id < 0 || c.id > 769999 || !/^\d+$/.test(c.priceWei) || BigInt(c.priceWei) <= 0n || BigInt(c.priceWei) > (1n << 96n) - 1n) || new Set(cards.map(c => c.id)).size !== cards.length) throw new Error("无效挂单");
  const total = cards.reduce((sum, c) => sum + BigInt(c.priceWei), 0n);
  return `${commandHead}\n从已读取卖单最低价开始，买入最多 ${cards.length} 张。逐一核对 listings、ownerOf 和 MAX_BUY，价格上限不提高。调用 buy(uint256[] tokenIds,uint256[] maxPrices)，参数 [${cards.map(c => c.id).join(",")}]、[${cards.map(c => c.priceWei).join(",")}]，value=${total} wei。失效或超过限价会跳过，余款退回；只按 Sold 日志报告实际成交张数和花费，无成交不得报告成功。`;
}
export function bidCommand(price: string, quantity: number, batch: number) {
  const wei = orderPrice(price);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 4294967295 || !Number.isInteger(batch) || batch < 0 || batch > 77) throw new Error("求购参数超出合约范围");
  return `${commandHead}\n发布求购：每张 ${price} BNB，数量 ${quantity}，${batch === 0 ? "不限批次" : `只收第 ${batch} 批`}。调用 placeBid(uint256 price,uint256 quantity,uint256 batchPlusOne)，参数 ${wei}、${quantity}、${batch}，value=${wei * BigInt(quantity)} wei，必须恰好等于出价×数量。合约批次从 0 开始，第 N 批的 batchPlusOne 就是 N。确认后发送，报告 bidId。`;
}
export function cardCommand(kind: "claim" | "redeem" | "list" | "unlist", id: number | string, price = "0.003") {
  const preparation = `读取 ownerOf(${id})、isActive(${id})、pendingDividend(${id})、repurchaseOf(${id})；核对卡牌属于我的钱包。`;
  if (kind === "list") return `${commandHead}\n${preparation}调用 list(uint256[] tokenIds,uint256[] prices)，参数 [${id}]、[${orderPrice(price)}]，售价 ${price} BNB。重复挂单可改价，卡牌不托管。`;
  if (kind === "unlist") return `${commandHead}\n核对 listings(${id}) 的卖家是我，调用 unlist(uint256[] tokenIds)，参数 [${id}]。`;
  if (kind === "claim") return `${commandHead}\n${preparation}检查批次是否满额，或自本批第一张付费卡铸出已满 7 天；读取最新 undistributedTax()，模拟 claim(uint256 tokenId)，参数 ${id}。即便 pendingDividend 为 0，到期同步后也可能有分红，以模拟结果为准；无可领取额则不要发送。领取保留 NFT 与兑换权。`;
  return `${commandHead}\n${preparation}用卡号除以 10000 得到从 0 开始的 batchId，读取 batchAccounted(batchId)、batchOpenedAt() 和 STALL_RELEASE()，检查已售满或本批已满 7 天。模拟 redeem(uint256 tokenId)，参数 ${id}，先告诉我将收到的代币和 BNB；销毁不可逆、终身铸造名额不会恢复，必须等我再次确认才发送。未满 7 天且未售满则停止。`;
}
export const agentCommands = [
  { group: "铸造", title: "铸造卡牌", fn: "mint(uint256 count)", desc: "每张 0.002 BNB，每地址终身最多 7 张。", text: mintCommand(1) },
  { group: "买", title: "买入挂单卡牌", fn: "buy(tokenIds, maxPrices)", desc: "检查最新卖单，按最高限价购买。", text: `${commandHead}\n卡号【填写整数，不带 #】，最高价【填写 BNB】。先读取有效卖单，调用 buy([卡号],[最高价 wei])，value 为最高价 wei。超过限价会跳过，仅按 Sold 日志确认实际成交。` },
  { group: "买", title: "发布求购", fn: "placeBid(price, quantity, batchPlusOne)", desc: "BNB 托管在金库，未成交部分可撤回。", text: `${commandHead}\n每张出价【BNB】，数量【整数】，只收第【N】批或不限。调用 placeBid(出价 wei,数量,批次参数)，value=出价 wei×数量。不限填 0；页面第 N 批填 N（底层 batchId=N-1）。确认后发送并报告 bidId。` },
  { group: "买", title: "撤销求购", fn: "cancelBids(bidIds)", desc: "退回未成交部分的托管 BNB。", text: `${commandHead}\n读取 bids(【bidId】)，确认买家为我且仍有剩余数量。调用 cancelBids([【bidId】])，报告实际退款。` },
  { group: "卖", title: "挂单出售", fn: "list(tokenIds, prices)", desc: "卡牌留在钱包，重复调用可以改价。", text: `${commandHead}\n卡号【整数】，售价【BNB】。核对 ownerOf(卡号) 为我，调用 list([卡号],[售价 wei])。` },
  { group: "卖", title: "卖给求购", fn: "sellToBid(bidId, tokenIds)", desc: "扣除 1% 手续费，未领分红归卖家。", text: `${commandHead}\n卡号【整数】，最低接受价【BNB】。分页读取 getActiveBids(cursor,500)，从 cursor=0 开始至 next=nextBidId()，找最高价且有余量、批次匹配的求购。低于最低价则停止。核对卡牌为我所有，调用 sellToBid(bidId,[卡号])，确认后发送。` },
  { group: "卖", title: "下架挂单", fn: "unlist(tokenIds)", desc: "取消卖单，不转移卡牌。", text: cardCommand("unlist", "【卡号】") },
  { group: "收益", title: "领取分红", fn: "claim(tokenId)", desc: "取出分红，保留 NFT 和代币兑换权。", text: cardCommand("claim", "【卡号】") },
  { group: "收益", title: "销毁兑换", fn: "redeem(tokenId)", desc: "本批售满或本批满 7 天后可兑换，不可撤销。", text: cardCommand("redeem", "【卡号】") },
  { group: "收益", title: "同步税收", fn: "sync()", desc: "按合约条件登记税收并触发到期分配。", text: `${commandHead}\n读取 undistributedTax()、userMints()、totalWeight()、batchOpenedAt()、STALL_RELEASE()；展示本批是否售满或满 7 天及同步预览。调用 sync()，value=0；未到期同步不代表已分红。` },
  { group: "收益", title: "提取卖卡收入", fn: "withdrawProceeds(to)", desc: "只提取记在自己地址下的待付卖卡款。", text: `${commandHead}\n读取 proceedsOwed(我的地址)，大于 0 时调用 withdrawProceeds(我的地址)，value=0，确认后发送。` },
] as const;