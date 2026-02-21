import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (dateString: string, formatStr: string = 'dd/MM/yyyy'): string => {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr, { locale: ptBR });
  } catch (error) {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  return formatDate(dateString, 'dd/MM/yyyy HH:mm');
};

export const formatTimeAgo = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch (error) {
    return dateString;
  }
};

/** Formata duração em horas para exibição (ex: 24 -> "24 horas", 48 -> "2 dias") */
export const formatDuracao = (duracaoHoras: number): string => {
  if (!duracaoHoras || duracaoHoras < 1) return '';
  if (duracaoHoras >= 24 * 30) {
    const meses = Math.round(duracaoHoras / (24 * 30));
    return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  }
  if (duracaoHoras >= 24) {
    const dias = Math.round(duracaoHoras / 24);
    return `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
  }
  return `${duracaoHoras} ${duracaoHoras === 1 ? 'hora' : 'horas'}`;
};

