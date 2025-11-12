export const getDifficultyColor = (difficulty?: number): string => {
  switch (difficulty) {
    case 1:
      return 'success';
    case 2:
      return 'info';
    case 3:
      return 'warning';
    case 4:
      return 'danger';
    default:
      return 'secondary';
  }
};

export const getDifficultyLabel = (difficulty?: number): string => {
  switch (difficulty) {
    case 1:
      return 'Dễ';
    case 2:
      return 'Trung bình';
    case 3:
      return 'Khó';
    case 4:
      return 'Rất khó';
    default:
      return 'Không xác định';
  }
};
