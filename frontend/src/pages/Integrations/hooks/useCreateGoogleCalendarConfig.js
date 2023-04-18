import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import { createCalendarConfig } from '../../../services/GoogleCalendar';

const useCreateGoogleCalendarConfig = () => {
  const queryClient = useQueryClient();

  return useMutation((params) => createCalendarConfig(params), {
    onSuccess: () => {
      queryClient.invalidateQueries('googleCalendarConfig');
      toast.success('Configuração criada com sucesso!');
    },
    onError: (err) => {
      toast.error(err.response.data.error || 'Erro ao atualizar configuração!');
    },
  });
};

export default useCreateGoogleCalendarConfig;
