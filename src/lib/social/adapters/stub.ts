/**
 * Stub adapter — the shape every real adapter follows.
 *
 * Real adapters replace method bodies with provider API calls and a
 * platform-specific analytics mapper. Core app never changes.
 */
import type {
  AdapterContext,
  AnalyticsPoint,
  Capability,
  Comment,
  DateRange,
  MediaAsset,
  PublishInput,
  PublishResult,
  PublishTarget,
  SocialAdapter,
  SocialCategory,
  SocialPlatformId,
  TokenSet,
  WebhookSubscription,
  AccountProfile,
} from "../types";
import { NotSupportedError } from "../types";

export function createStubAdapter(config: {
  id: SocialPlatformId;
  name: string;
  category: SocialCategory;
  capabilities?: Capability[];
}): SocialAdapter {
  const caps = new Set<Capability>(
    config.capabilities ?? ["publish", "media_upload", "comments", "webhooks", "analytics"],
  );

  const need = (c: Capability) => {
    if (!caps.has(c)) throw new NotSupportedError(c);
  };

  return {
    id: config.id,
    name: config.name,
    category: config.category,
    capabilities: caps,

    async startConnect({ returnUrl, state }) {
      return { authorizationUrl: `https://example.com/oauth/${config.id}?state=${state}&redirect_uri=${encodeURIComponent(returnUrl)}` };
    },
    async completeConnect(): Promise<TokenSet> {
      return { accessToken: `stub-${config.id}`, expiresAt: new Date(Date.now() + 3600_000).toISOString() };
    },
    async disconnect() {},
    async refresh(ctx): Promise<TokenSet> {
      const next: TokenSet = { ...ctx.tokens, expiresAt: new Date(Date.now() + 3600_000).toISOString() };
      await ctx.persistTokens(next);
      return next;
    },

    async getProfile(): Promise<AccountProfile> {
      return { id: `${config.id}-profile`, handle: `@ROTHME`, displayName: "ROTHME" };
    },
    async getAnalytics(_ctx: AdapterContext, _range: DateRange): Promise<AnalyticsPoint[]> {
      need("analytics");
      return [];
    },
    async listPublishTargets(): Promise<PublishTarget[]> {
      return [{ id: `${config.id}-default`, label: config.name, kind: "profile" }];
    },
    async publish(_ctx, input: PublishInput): Promise<PublishResult> {
      need("publish");
      return { externalId: `stub-${Date.now()}`, postedAt: new Date().toISOString(), url: undefined };
    },
    async uploadMedia(_ctx, input): Promise<MediaAsset> {
      need("media_upload");
      return { id: `media-${Date.now()}`, url: input.url, kind: input.kind };
    },
    async listComments(): Promise<Comment[]> {
      need("comments");
      return [];
    },
    async subscribeWebhook(_ctx, input): Promise<WebhookSubscription> {
      need("webhooks");
      return { id: `wh-${Date.now()}`, event: input.event, callbackUrl: input.callbackUrl };
    },
  };
}
