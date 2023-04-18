import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import { updateCalendarConfig } from '../../../services/GoogleCalendar';

const useUpdateGoogleCalendarConfig = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (params) => updateCalendarConfig(params.id, params.updateData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('googleCalendarConfig');
        queryClient.invalidateQueries('googleCalendarConfigList');
        toast.success('Configuração atualizada com sucesso!');
      },
      onError: () => {
        toast.error('Erro ao atualizar configuração!');
      },
    }
  );
};

export default useUpdateGoogleCalendarConfig;
