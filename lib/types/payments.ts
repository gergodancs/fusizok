export type ShareContactOutcome =
  | "activated"
  | "needs_payment"
  | "already_active";

export type ShareContactResult =
  | {
      ok: true;
      outcome: "activated" | "already_active";
      conversationId: string;
      craftsmanId: string;
      jobId: string;
      usedCredit?: boolean;
    }
  | {
      ok: true;
      outcome: "needs_payment";
      bidId: string;
      jobId: string;
      craftsmanId: string;
    }
  | {
      ok: false;
      error: string;
    };

export type ContactActivationPollResult =
  | {
      ok: true;
      contactShared: true;
      conversationId: string;
    }
  | {
      ok: true;
      contactShared: false;
      status: string;
    }
  | {
      ok: false;
      error: string;
    };

export type CreateCheckoutSessionResult =
  | {
      ok: true;
      clientSecret: string;
      sessionId: string;
    }
  | {
      ok: false;
      error: string;
    };
