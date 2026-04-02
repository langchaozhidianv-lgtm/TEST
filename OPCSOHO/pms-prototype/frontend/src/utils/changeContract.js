const META_START = "[CHANGE_META]";
const META_END = "[/CHANGE_META]";
const FIELD_SEPARATOR = "\u3001";

function toNumberString(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value);
}

export function parseChangeFields(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  return String(value || "")
    .split(/\r?\n|,|;|\uFF0C|\uFF1B/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function extractChangeContractMeta(paymentTerms) {
  const source = String(paymentTerms || "");
  const startIndex = source.indexOf(META_START);
  const endIndex = source.indexOf(META_END);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return {
      meta: {},
      plainText: source
    };
  }

  const jsonText = source.slice(startIndex + META_START.length, endIndex).trim();
  const plainText = source.slice(endIndex + META_END.length).trim();

  try {
    const meta = JSON.parse(jsonText);
    return {
      meta: meta && typeof meta === "object" ? meta : {},
      plainText
    };
  } catch (error) {
    return {
      meta: {},
      plainText: source
    };
  }
}

export function buildChangeContractPaymentTerms({
  relatedContractId,
  changeFields,
  beforeAmount,
  afterAmount,
  changeReason,
  detailNote
}) {
  const payload = {
    related_contract_id: relatedContractId ? String(relatedContractId) : "",
    change_fields: parseChangeFields(changeFields),
    before_amount: toNumberString(beforeAmount),
    after_amount: toNumberString(afterAmount),
    change_reason: String(changeReason || "").trim()
  };

  const metaText = `${META_START}${JSON.stringify(payload)}${META_END}`;
  const noteText = String(detailNote || "").trim();
  return noteText ? `${metaText}\n${noteText}` : metaText;
}

export function getChangeContractViewModel(contract) {
  const { meta, plainText } = extractChangeContractMeta(contract?.payment_terms);
  const beforeAmount = meta.before_amount ?? "";
  const afterAmount = meta.after_amount ?? "";
  const relatedContractId = meta.related_contract_id ?? "";
  const changeFields = parseChangeFields(meta.change_fields);
  const changeReason = meta.change_reason ?? "";

  return {
    relatedContractId: relatedContractId ? String(relatedContractId) : "",
    changeFields,
    changeFieldsText: changeFields.join(FIELD_SEPARATOR),
    beforeAmount,
    afterAmount,
    changeReason,
    detailNote: plainText
  };
}
