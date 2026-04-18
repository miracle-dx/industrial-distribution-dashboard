// src/mapUtils.test.js

// 你自己写的业务函数（处理地图省份数据）
function getProvinceType(provinceName) {
  if (provinceName.includes('山西') || provinceName.includes('内蒙古')) {
    return '能源省份';
  }
  if (provinceName.includes('广东') || provinceName.includes('浙江')) {
    return '沿海经济省份';
  }
  return '其他省份';
}

// 测试1：山西应该是能源省份
test('山西是能源省份', () => {
  const result = getProvinceType('山西省');
  expect(result).toBe('能源省份');
});

// 测试2：广东是沿海省份
test('广东是沿海经济省份', () => {
  const result = getProvinceType('广东省');
  expect(result).toBe('沿海经济省份');
});

// 测试3：内蒙古自治区是能源省份
test('内蒙古是能源省份', () => {
  const result = getProvinceType('内蒙古自治区');
  expect(result).toBe('能源省份');
});

// 测试4：四川返回其他
test('四川是其他省份', () => {
  const result = getProvinceType('四川省');
  expect(result).toBe('其他省份');
});