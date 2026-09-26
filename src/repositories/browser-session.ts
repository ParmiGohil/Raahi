import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import type { TripState } from "../domain/types";
import { initialState } from "../fixtures/trip";
import { TripRepository, sessionSecret } from "./trip";

const lifetime = 7 * 86400 * 1000;
function key(secret: string) {
  return createHash("sha256").update(secret).digest();
}
export function sealSession(
  id: string,
  state: TripState,
  secret = sessionSecret(),
  now = Date.now(),
) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(secret), iv);
  cipher.setAAD(Buffer.from(id));
  const packed = deflateRawSync(
    Buffer.from(JSON.stringify({ expires: now + lifetime, state })),
  );
  const body = Buffer.concat([cipher.update(packed), cipher.final()]);
  const value = Buffer.concat([iv, cipher.getAuthTag(), body]).toString(
    "base64url",
  );
  if (value.length > 3800)
    throw new Error("Demo session exceeds cookie storage limit");
  return value;
}
export function openSession(
  id: string,
  value: string,
  secret = sessionSecret(),
  now = Date.now(),
): TripState {
  const bytes = Buffer.from(value, "base64url");
  if (bytes.length < 29 || value.length > 3800)
    throw new Error("Invalid session size");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key(secret),
    bytes.subarray(0, 12),
  );
  decipher.setAAD(Buffer.from(id));
  decipher.setAuthTag(bytes.subarray(12, 28));
  const packed = Buffer.concat([
    decipher.update(bytes.subarray(28)),
    decipher.final(),
  ]);
  const { state, expires } = JSON.parse(
    inflateRawSync(packed, { maxOutputLength: 100000 }).toString(),
  );
  if (typeof expires !== "number" || expires < now)
    throw new Error("Demo session expired");
  return state as TripState;
}
/** Per-browser hosted demo. Cookies survive function cold starts; no cross-device sharing. */
export class BrowserSessionRepository extends TripRepository {
  constructor(
    private value: string | undefined,
    private persist: (value: string) => void,
  ) {
    super();
  }
  protected async load(id: string) {
    if (!this.value) return initialState();
    return openSession(id, this.value);
  }
  protected async save(id: string, state: TripState) {
    const value = sealSession(id, state);
    this.persist(value);
    this.value = value;
  }
}
