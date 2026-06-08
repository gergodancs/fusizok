/** Auth nélküli fejlesztéshez – később a bejelentkezett felhasználó ID-ja kerül ide. */
export const TEST_CLIENT_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

export const TEST_CLIENT_PROFILE = {
  id: TEST_CLIENT_ID,
  role: "client" as const,
  full_name: "Teszt Elek",
};
