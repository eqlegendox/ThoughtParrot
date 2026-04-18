export async function embed(text: string, ai: Ai): Promise<number[]> {
  const result = await ai.run("@cf/baai/bge-base-en-v1.5", { text: [text] }) as { data: number[][] }
  return result.data[0]
}
