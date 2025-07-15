require('@testing-library/jest-dom');

beforeAll(() => {
  window.alert = jest.fn();
  window.confirm = jest.fn(() => true);
}); 