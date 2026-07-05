import { describe, expect, it } from "vitest";
import { recommendSession, type RecommendInput } from "./recommend";
import type { NapSession } from "./types";

/** Minimal completed session for personalization tests. */
function loggedNap(
  chosenMinutes: number,
  kssBefore: number,
  kssAfter: number,
  index: number,
): NapSession {
  return {
    id: `test-${chosenMinutes}-${index}`,
    createdAt: "2026-07-01T13:00:00.000Z",
    timeOfDay: "13:00",
    kssBefore,
    sleepLastNight: "6-7",
    availableTime: "30-40",
    activityAfter: "focus",
    recommendedMinutes: chosenMinutes,
    chosenMinutes,
    usedCaffeine: false,
    kssAfter,
    fellAsleep: "yes",
    sleepOnsetBucket: "5-10",
    grogginess: "little",
    completedCheckin: true,
  };
}

function input(overrides: Partial<RecommendInput>): RecommendInput {
  return {
    kss: 6,
    sleepLastNight: "6-7",
    availableTime: "20-25",
    activityAfter: "focus",
    hour: 14,
    history: [],
    ...overrides,
  };
}

describe("recommendSession (brief Part 6, required cases)", () => {
  it("1. KSS 9 + 20 min window + meeting after → 20, not 90", () => {
    const result = recommendSession(
      input({ kss: 9, availableTime: "20-25", activityAfter: "meeting" }),
    );
    expect(result.session.minutes).toBe(20);
  });

  it("2. KSS 9 + 4 h sleep + 2 h free + no rush + 13:30 → 90", () => {
    const result = recommendSession(
      input({
        kss: 9,
        sleepLastNight: "<5",
        availableTime: "90+",
        activityAfter: "rest",
        hour: 13.5,
      }),
    );
    expect(result.session.minutes).toBe(90);
  });

  it("3. KSS 6 + 90 min free + must work right after → 20, not 90", () => {
    const result = recommendSession(
      input({ kss: 6, availableTime: "90+", activityAfter: "focus" }),
    );
    expect(result.session.minutes).toBe(20);
    expect(
      result.rejected.find((r) => r.session.minutes === 90)?.code,
    ).toBe("sleep_inertia_risk");
  });

  it("4. KSS 8 + driving after → 10–20 + safety warning present", () => {
    const result = recommendSession(
      input({ kss: 8, availableTime: "30-40", activityAfter: "driving" }),
    );
    expect([10, 20]).toContain(result.session.minutes);
    expect(result.reasons.some((r) => r.code === "safety_driving")).toBe(true);
    expect(
      result.rejected.find((r) => r.session.minutes === 30)?.code,
    ).toBe("safety_cap");
  });

  it("5. repeat-flow defaults at 21:30 → Skip + night-sleep warning", () => {
    const result = recommendSession(input({ hour: 21.5 }));
    expect(result.session.key).toBe("skip");
    expect(
      result.reasons.some((r) => r.code === "night_sleep_risk"),
    ).toBe(true);
  });

  it("5b. after midnight (01:00) → Skip + night-sleep warning, not a nap", () => {
    const result = recommendSession(input({ kss: 8, hour: 1 }));
    expect(result.session.key).toBe("skip");
    expect(
      result.reasons.some((r) => r.code === "night_sleep_risk"),
    ).toBe(true);
  });

  it("6. personalization: 4×20 min at +3 vs 3×30 min at +1, ambiguous inputs → 20 + best-results reason", () => {
    const history: NapSession[] = [
      loggedNap(20, 7, 4, 1),
      loggedNap(20, 8, 5, 2),
      loggedNap(20, 6, 3, 3),
      loggedNap(20, 7, 4, 4),
      loggedNap(30, 7, 6, 1),
      loggedNap(30, 8, 7, 2),
      loggedNap(30, 6, 5, 3),
    ];
    const result = recommendSession(
      input({
        kss: 7,
        availableTime: "30-40",
        activityAfter: "kids",
        history,
      }),
    );
    expect(result.session.minutes).toBe(20);
    const personal = result.reasons.find((r) => r.code === "personal_best");
    expect(personal).toBeDefined();
    expect(personal?.minutes).toBe(20);
  });
});

describe("recommendSession invariants", () => {
  it("never recommends 45 or 60 minutes for any input", () => {
    const kssValues = [1, 4, 6, 8, 9];
    const windows = ["10-15", "20-25", "30-40", "60", "90+"] as const;
    const activities = [
      "focus",
      "meeting",
      "exercise",
      "driving",
      "kids",
      "rest",
    ] as const;
    const hours = [9, 13, 17, 21];
    for (const kss of kssValues)
      for (const availableTime of windows)
        for (const activityAfter of activities)
          for (const hour of hours) {
            const result = recommendSession(
              input({ kss, availableTime, activityAfter, hour }),
            );
            expect([0, 10, 20, 25, 30, 90]).toContain(result.session.minutes);
            expect(result.session.minutes).not.toBe(45);
            expect(result.session.minutes).not.toBe(60);
          }
  });

  it("never recommends a session longer than the stated window", () => {
    const result = recommendSession(
      input({ kss: 9, sleepLastNight: "<5", availableTime: "10-15" }),
    );
    expect(result.session.minutes).toBeLessThanOrEqual(15);
  });

  it("always populates reasons and rejected", () => {
    const result = recommendSession(input({ kss: 8 }));
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.rejected.length).toBeGreaterThan(0);
    for (const r of result.reasons) {
      expect(r.learnCardId).toBeTruthy();
    }
  });

  it("after 16:00 caps at 20 minutes and warns about night sleep", () => {
    const result = recommendSession(
      input({ kss: 9, sleepLastNight: "<5", availableTime: "90+", hour: 17, activityAfter: "rest" }),
    );
    expect(result.session.minutes).toBeLessThanOrEqual(20);
    expect(
      result.reasons.some(
        (r) => r.code === "late_day_cap" || r.code === "night_sleep_risk",
      ),
    ).toBe(true);
  });
});
