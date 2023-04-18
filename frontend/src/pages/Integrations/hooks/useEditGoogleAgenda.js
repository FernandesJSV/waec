import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import { updateGoogleAgenda } from '../../../services/GoogleCalendar';

const useEditGoogleAgenda = () => {
  const queryClient = useQueryClient();

  return useMutation((params) => updateGoogleAgenda(params), {
    onSuccess: () => {
      queryClient.invalidateQueries('google_agenda_list');
      toast.success('Agenda editada com sucesso com sucesso!');
    },
    onError: (err) => {
      toast.error(err.response.data.error || 'Erro ao atualizar configuração!');
    },
  });
};

export default useEditGoogleAgenda;
