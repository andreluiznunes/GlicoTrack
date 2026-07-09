// Lista de medicações comuns no tratamento de diabetes, só para facilitar o
// preenchimento no formulário — "medication_name" continua sendo texto livre
// no banco (sem check constraint), então "Outro" sempre permite digitar
// qualquer nome que não esteja aqui.
export const MEDICATION_GROUPS: { label: string; options: string[] }[] = [
  {
    label: "Insulinas",
    options: [
      "Insulina Regular",
      "Insulina NPH",
      "Insulina Glargina",
      "Insulina Detemir",
      "Insulina Degludeca",
      "Insulina Lispro",
      "Insulina Asparte",
      "Insulina Glulisina",
    ],
  },
  {
    label: "Outros medicamentos",
    options: [
      "Metformina",
      "Glibenclamida",
      "Gliclazida",
      "Glimepirida",
      "Sitagliptina",
      "Vildagliptina",
      "Empagliflozina",
      "Dapagliflozina",
      "Liraglutida",
    ],
  },
];

export const ALL_MEDICATIONS = MEDICATION_GROUPS.flatMap((group) => group.options);
