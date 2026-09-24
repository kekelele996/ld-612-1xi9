export interface PolicyDocument {
  id: number;
  title: string;
  version_label: string;
  raw_text: string;
  /** 自动分段后归一化的条款编号，逗号分隔，如 "1,2,3" */
  normalized_sections: string;
  imported_at: string;
}
