const ZenUI = require("../zenui");

test("Button should create an element", () => {
    const button = ZenUI.Button({ label: "Test" });
    expect(button.tagName).toBe("BUTTON");
});
