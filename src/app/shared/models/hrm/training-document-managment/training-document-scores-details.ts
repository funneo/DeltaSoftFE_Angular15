export interface TrainingDocumentScoresDetails {
    id?: number;

    documentId?: string;        // Guid (nullable)

    criteriaId?: number;        // Tiêu chí (có thể nullable nếu tạo động)

    criteriaName?: string;      // Tên tiêu chí
    
    criteriaNotes?: string;      // Tên tiêu chí

    weight?: number;            // Trọng số (VD: 30%)

    score?: number;             // Điểm tối đa hoặc thang điểm

    assigneeScore?: number; 
}
