import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import { createGoogleAgenda } from '../../../services/GoogleCalendar';

const useCreateGoogleAgenda = () => {
  const queryClient = useQueryClient();

  return useMutation((params) => createGoogleAgenda(params), {
    onSuccess: () => {
      queryClient.invalidateQueries('google_agenda_list');
      toast.success('Agenda criada com sucesso com sucesso!');
    },
    onError: (err) => {
      toast.error(err.response.data.error || 'Erro ao atualizar configuração!');
    },
  });
};

export default useCreateGoogleAgenda;
