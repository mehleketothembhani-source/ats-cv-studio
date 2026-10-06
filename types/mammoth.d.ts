declare module "mammoth/mammoth.browser" {
  interface Result {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }

  interface ArrayBufferInput {
    arrayBuffer: ArrayBuffer;
  }

  export function extractRawText(input: ArrayBufferInput): Promise<Result>;
  export function convertToHtml(input: ArrayBufferInput): Promise<Result>;
}
