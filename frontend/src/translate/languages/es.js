const messages = {
	es: {
		translations: {
			signup: {
				title: "Registrar",
				toasts: {
					success: "¡Usuario creado con éxito! Haz tu login!!!.",
					fail: "Error al crear usuario. Verifique los datos ingresados.",
				},
				form: {
					name: "Nonbre",
					email: "Email",
					password: "Contraseña",
					company: "Nombre de la empresa",
					phone: "Número Whatsapp"
				},
				buttons: {
					submit: "Registrar",
					login: "¿Ya tienes una cuenta? Inicia sesión!",
				},
			},
			login: {
				title: "Login",
				form: {
					email: "Email",
					password: "Contraseña",
				},
				buttons: {
					submit: "Login",
					register: "¿No tienes una cuenta? Regístrate!",
				},
			},
			companies: {
				title: "Registro de Empresas",
				form: {
					name: "Nombre de la empresa",
					plan: "Plan",
					token: "Token",
					submit: "Crear",
					success: "Empresa creada con éxito!",
				},
			},
			auth: {
				toasts: {
					success: "Login exitoso!",
				},
				dueDate: {
					expiration: "Su suscripción expira en",
					days: "dias!",
					day: "dia!",
					expirationToday: "Su suscripción expira hoy!",
				},
				token: "Token",
			},
			dashboard: {
				charts: {
					perDay: {
						title: "Atendimentos hoje: ",
					},
				},
			},
			connections: {
				title: "Conexiones",
				toasts: {
					deleted: "Conexión eliminada con éxito!",
				},
				confirmationModal: {
					deleteTitle: "Borrar conexión",
					deleteMessage: "Usted está seguro? Esta acción no se puede deshacer.",
					disconnectTitle: "Desconectar WhatsApp",
					disconnectMessage: "Usted está seguro? Esta acción no se puede deshacer.",
				},
				buttons: {
					add: "Agregar WhatsApp",
					disconnect: "Desconectar",
					tryAgain: "Intentar de nuevo",
					qrcode: "QR CODE",
					newQr: "Nuevo QR CODE",
					connecting: "Conectando",
				},
				toolTips: {
					disconnected: {
						title: "Falló la conexión con el celular",
						content: "Verifique que su celular esté conectado a internet y que WhatsApp esté abierto",
					},
					qrcode: {
						title: "Esperando lectura del QR Code",
						content: "Click en el botón 'QR CODE' para obtener un nuevo QR Code",
					},
					connected: {
						title: "Conexión exitosa",
					},
					timeout: {
						title: "Se ha perdido la conexión con el teléfono móvil.",
						content: "Asegúrese de que su teléfono esté conectado a Internet y WhatsApp esté abierto, o haga clic en el botón 'Desconectar' para obtener un nuevo código QR",
					},
				},
				table: {
					name: "Nombre",
					status: "Estado",
					lastUpdate: "Última actualización",
					default: "Por defecto",
					actions: "Acciones",
					session: "Session",
					number: "Número do Whatsapp"
				},
			},
			whatsappModal: {
				title: {
					add: "Añadir WhatsApp",
					edit: "Editar WhatsApp",
				},
				form: {
					name: "Nombre",
					default: "Por defecto",
					maxUseBotQueues: "Número máximo de veces que se enviará el chatbot",
					expiresTicket: "Finalizar chats abiertos después de x horas",
					outOfHoursMessage: "Mensaje fuera de horario",
					greetingMessage: "Mensaje de bienvenida",
					complationMessage: "Mensaje de finalización",
					token: "Token para API",
				},
				buttons: {
					okAdd: "Añadir",
					okEdit: "Guardar",
					cancel: "Cancelar",
				},
				success: "WhatsApp creado con éxito!",
			},
			qrCode: {
				message: "Lea el código QR con su teléfono móvil",
			},
			contacts: {
				title: "Contactos",
				toasts: {
					deleted: "Contacto eliminado con éxito!",
				},
				searchPlaceholder: "Buscar contato...",
				confirmationModal: {
					deleteTitle: "Borrar contato ",
					importTitlte: "Importar contatos",
					deleteMessage: "¿Está seguro de que desea eliminar este contacto? Todas las citas relacionadas se perderán.",
					importMessage: "Desear importar los contactos de su teléfono?",
				},
				buttons: {
					import: "Importar Contacto",
					add: "Agregar Contato",
					export: "Exportar Contacto",
				},
				table: {
					name: "Nombre",
					whatsapp: "WhatsApp",
					email: "Email",
					actions: "Acciones",
				},
			},
			forwardMessage: {
				text: "Reenviar",
			},
			forwardMessageModal: {
				title: "Reenviar mensaje",
				buttons: {
					ok: "Reenviar",
				}
			},
			contactModal: {
				title: {
					add: "Añadir contato",
					edit: "Editar contato",
				},
				form: {
					mainInfo: "Datos de contacto",
					extraInfo: "Información adicional",
					name: "Nombre",
					number: "Número de Whatsapp",
					email: "Email",
					extraName: "Nombre del campo",
					extraValue: "Valor",
				},
				buttons: {
					addExtraInfo: "Añadir campo",
					okAdd: "Añadir",
					okEdit: "Guardar",
					cancel: "Cancelar",
				},
				success: "Contacto creado con éxito!",
			},
			queueModal: {
				title: {
					add: "Añadir fila",
					edit: "Editar fila",
				},
				form: {
					name: "Nombre",
					color: "Cor",
					greetingMessage: "Mensaje de bienvenida",
					complationMessage: "Mensaje de finalización",
					outOfHoursMessage: "Mensaje fuera de horario",
					token: "Token API",
				},
				buttons: {
					okAdd: "Añadir",
					okEdit: "Guardar",
					cancel: "Cancelar",
				},
			},
			userModal: {
				title: {
					add: "Añadir usuario",
					edit: "Editar usuario",
				},
				form: {
					name: "Nombre",
					email: "Email",
					password: "Contraseña",
					farewellMessage: "Mensaje de despedida",
					profile: "Perfil",
					whatsapp: "Conexão Padrão",
					startWork: "Iniciar trabajo",
					endWork: "Finalizar trabajo",
				},
				buttons: {
					okAdd: "Añadir",
					okEdit: "Guardar",
					cancel: "Cancelar",
				},
				success: "Usuario creado con éxito!",
			},
			companyModal: {
				title: {
					add: "Añadir empresa",
					edit: "Editar empresa",
				},
				form: {
					name: "Nombre",
					email: "Email",
					passwordDefault: "Contraseña",
					numberAttendants: "Usuarios",
					numberConections: "Conexiones",
				},
				buttons: {
					okAdd: "Añadir",
					okEdit: "Guardar",
					cancel: "Cancelar",
				},
				success: "Empresa creada con éxito!",
			},
			scheduleModal: {
				title: {
					add: "Nueva Agenda",
					edit: "Editar Agenda",
				},
				form: {
					body: "Mensaje",
					contact: "Contacto",
					sendAt: "Fecha de Agenda",
					sentAt: "Fecha de Envío",
				},
				buttons: {
					okAdd: "Añadir",
					okEdit: "Guardar",
					cancel: "Cancelar",
				},
				success: "Agenda creada con éxito!",
			},
			tagModal: {
				title: {
					add: "Nuevo Tag",
					edit: "Editar Tag",
				},
				form: {
					name: "Nombre",
					color: "Cor",
				},
				buttons: {
					okAdd: "Añaadir",
					okEdit: "Guardar",
					cancel: "Cancelar",
				},
				success: "Tag creado con éxito!",
			},
			ratingModal: {
				title: {
					add: "Añaadir menu de calificación",
					edit: "Editar menu de calificación",
				},
				buttons: {
					okAdd: "Guardar",
					okEdit: "Editar",
					cancel: "Cancelar",
					options: "Añadir opción",
				},
				form: {
					name: "Nombre",
					message: "Mensaje de calificación",
					options: "Opciones de calificación",
					extraName: "Nombre del campo",
					extraValue: "Valor",
				},
				success: "Calificación creada con éxito!",
			},
			chat: {
				noTicketMessage: "Selecione una Conversación",
			},
			ticketsManager: {
				buttons: {
					newTicket: "Nuevo",
				},
			},
			ticketsQueueSelect: {
				placeholder: "Filas",
			},
			tickets: {
				toasts: {
					deleted: "Conversación eliminada",
				},
				notification: {
					message: "Mensaje de",
				},
				tabs: {
					open: { title: "Abierto" },
					closed: { title: "Resueltos" },
					search: { title: "Buscar" },
				},
				search: {
					placeholder: "Buscar Conversación",
				},
				buttons: {
					showAll: "Todos",
				},
			},
			transferTicketModal: {
				title: "Transferir Conversación",
				fieldLabel: "Escriba para buscar un usuario",
				fieldQueueLabel: "Transferir para fila",
				fieldQueuePlaceholder: "Selecione una fila",
				noOptions: "Ningun usuario encontrado",
				buttons: {
					ok: "Transferir",
					cancel: "Cancelar",
				},
			},
			ticketsList: {
				pendingHeader: "Esperando",
				assignedHeader: "Atendiendo",
				noTicketsTitle: "Nada aqui!",
				noTicketsMessage: "No se encontró ningún servicio con este estado o término de búsqueda",
				buttons: {
					accept: "Aceptar",
					reopen: "Reabrir",
					closed: "Cerrar",
				},
			},
			newTicketModal: {
				title: "Crear Conversación",
				fieldLabel: "Escriba para buscar un usuario",
				add: "Añadir",
				buttons: {
					ok: "Guardar",
					cancel: "Cancelar",
				},
			},
			mainDrawer: {
				listItems: {
					dashboard: "Dashboard",
					connections: "Conexiones",
					tickets: "Conversaciones",
					quickMessages: "Respuestas Rápidas",
					contacts: "Contactos",
					queues: "Filas & Chatbot",
					tags: "Tags",
					administration: "Administración",
					companies: "Empresas",
					users: "Usuarios",
					settings: "Configuraciónes",
					ratings: "Formularios de Calificación",
					helps: "Ayuda",
					messagesAPI: "API",
					schedules: "Agendamientos",
					campaigns: "Campañas",
					annoucements: "Informaciones",
					chats: "Chat Interno",
					financeiro: "Financeiro",
				},
				appBar: {
					user: {
						profile: "Perfil",
						logout: "Salir",
					},
					refresh: "Atualizar",
				},
			},
			languages: {
				undefined: "Idioma",
				"pt-BR": "Português",
				es: "Español",
				en: "English",
				tr: "Türkçe"
			},
			messagesAPI: {
				title: "API",
				textMessage: {
					number: "Número",
					body: "Mensaje",
					token: "Token Adicionado",
				},
				mediaMessage: {
					number: "Número",
					body: "Nombre del archivo",
					media: "Archivo",
					token: "Token Adicionado",
				},
			},
			notifications: {
				noTickets: "Ninguna notificación",
			},
			quickMessages: {
				title: "Respuestas Rápidas",
				buttons: {
					add: "Nueva Respuesta",
				},
				dialog: {
					shortcode: "Atajo",
					message: "Respuesta",
				},
			},
			contactLists: {
				title: "Listas de Contatos",
				table: {
					name: "Nombre",
					contacts: "Contactos",
					actions: "Acciones",
				},
				buttons: {
					add: "Nueva Lista",
				},
				dialog: {
					name: "Nombre",
					company: "Empresa",
					okEdit: "Editar",
					okAdd: "Añadir",
					add: "Añadir",
					edit: "Editar",
					cancel: "Cancelar",
				},
				confirmationModal: {
					deleteTitle: "Borrar",
					deleteMessage: "Esta seguro que desea borrar esta lista?",
				},
				toasts: {
					deleted: "Registro eliminado",
				},
			},
			contactListItems: {
				title: "Contactos",
				searchPlaceholder: "Buscar Contacto",
				buttons: {
					add: "Nueva Contacto",
					lists: "Listas",
					import: "Importar",
				},
				dialog: {
					name: "Nombre",
					number: "Número",
					whatsapp: "Whatsapp",
					email: "E-mail",
					okEdit: "Editar",
					okAdd: "Añadir",
					add: "Añadir",
					edit: "Editar",
					cancel: "Cancelar",
				},
				table: {
					name: "Nombre",
					number: "Número",
					whatsapp: "Whatsapp",
					email: "E-mail",
					actions: "Acciones",
				},
				confirmationModal: {
					deleteTitle: "Borrar",
					deleteMessage: "Esta a punto de borrar este contacto, esta seguro?",
					importMessage: "Desear importar los contactos?",
					importTitlte: "Importar",
				},
				toasts: {
					deleted: "Registro eliminado",
				},
			},
			campaigns: {
				title: "Campañas",
				searchPlaceholder: "Buscar Campaña",
				buttons: {
					add: "Nueva Campaña",
					contactLists: "Listas de Contatos",
				},
				table: {
					name: "Nombre",
					whatsapp: "Conexión",
					contactList: "Lista de Contatos",
					status: "Estado",
					scheduledAt: "Agendamentos",
					completedAt: "Concluído",
					confirmation: "Confirmación",
					actions: "Acciones",
				},
				dialog: {
					new: "Nuevo Campaña",
					update: "Editar Campaña",
					readonly: "Visualizar Campaña",
					form: {
						name: "Nombre",
						message1: "Mensaje 1",
						message2: "Mensaje 2",
						message3: "Mensaje 3",
						message4: "Mensaje 4",
						message5: "Mensaje 5",
						confirmationMessage1: "Mensaje de Confirmación 1",
						confirmationMessage2: "Mensaje de Confirmación 2",
						confirmationMessage3: "Mensaje de Confirmación 3",
						confirmationMessage4: "Mensaje de Confirmación 4",
						confirmationMessage5: "Mensaje de Confirmación 5",
						messagePlaceholder: "Contenido del Mensaje",
						whatsapp: "Conexión",
						status: "Estado",
						scheduledAt: "Agendamientos",
						confirmation: "Confirmación",
						contactList: "Lista de Contatos",
					},
					buttons: {
						add: "Añadir",
						edit: "Actualizar",
						okadd: "Ok",
						cancel: "Cancelar Campaña",
						restart: "Reiniciar Campaña",
						close: "Cerrar",
						attach: "Adjuntar Archivo",
					},
				},
				confirmationModal: {
					deleteTitle: "Borrar",
					deleteMessage: "Esta accion no se puede deshacer, esta seguro?",
				},
				toasts: {
					success: "Operación exitosa",
					cancel: "Campaña cancelada",
					restart: "Campaña reiniciada",
					deleted: "Registro eliminado",
				},
			},
			announcements: {
				title: "Informativos",
				searchPlaceholder: "Buscar",
				buttons: {
					add: "Nuevo Informativo",
					contactLists: "Listas de Informativos",
				},
				table: {
					priority: "Prioridad",
					title: "Titulo",
					text: "Texto",
					mediaName: "Archivo",
					status: "Estado",
					actions: "Acciones",
				},
				dialog: {
					edit: "Editar Informativo",
					add: "Nuevo Informativo",
					update: "Editar Informativo",
					readonly: "Solo visualizar",
					form: {
						priority: "Prioridad",
						title: "Titulo",
						text: "Texto",
						mediaPath: "Archivo",
						status: "Estado",
					},
					buttons: {
						add: "Añadir",
						edit: "Atualizar",
						okadd: "Ok",
						cancel: "Cancelar",
						close: "Cerrar",
						attach: "Adjuntar Archivo",
					},
				},
				confirmationModal: {
					deleteTitle: "Borrar",
					deleteMessage: "Esta accion no se puede deshacer, esta seguro?",
				},
				toasts: {
					success: "Operación exitosa",
					deleted: "Registro eliminado",
				},
			},
			campaignsConfig: {
				title: "Configuración de Campañas",
			},
			queues: {
				title: "Filas & Chatbot",
				table: {
					name: "Nombre",
					color: "Cor",
					greeting: "Mensaje de bienvenida",
					actions: "Acciones",
				},
				buttons: {
					add: "Añadir fila",
				},
				confirmationModal: {
					deleteTitle: "Borrar",
					deleteMessage: "¿Estás seguro? ¡Esta acción no se puede revertir! Las llamadas en esta cola seguirán existiendo, pero ya no tendrán ninguna cola asignada.",
				},
			},
			queueSelect: {
				inputLabel: "Filas",
			},
			users: {
				title: "Usuários",
				table: {
					status: "Estado",
					name: "Nombre",
					email: "Email",
					profile: "Perfil",
					whatsapp: "Whatsapp por defecto",
					startWork: "Inicio de trabajo",
					endWork: "Fin de trabajo",
					actions: "Acciones",
				},
				buttons: {
					add: "Añadir usuario",
				},
				toasts: {
					deleted: "Usuario eliminado con éxito.",
				},
				confirmationModal: {
					deleteTitle: "Borrar",
					deleteMessage: "Todos los datos del usuario se perderán. Las llamadas abiertas de este usuario se moverán a la cola.",
				},
			},
			compaies: {
				title: "Empresas",
				table: {
					status: "Activo",
					name: "Nombre",
					email: "Email",
					numberAttendants: "Convenciones",
					numberConections: "Conexiones",
					value: "Valor",
					namePlan: "Nombre Plan",
					numberQueues: "Filas",
					useCampaigns: "Campañas",
					useExternalApi: "Rest API",
					useFacebook: "Facebook",
					useInstagram: "Instagram",
					useWhatsapp: "Whatsapp",
					useInternalChat: "Chat Interno",
					useSchedules: "Agendamientos",
					createdAt: "Creado en",
					dueDate: "Vencimiento",
					lastLogin: "Ult. Login",
					actions: "Acciones",
				},
				buttons: {
					add: "Añadir Empresa",
				},
				toasts: {
					deleted: "Empresa eliminado con éxito",
				},
				confirmationModal: {
					deleteTitle: "Borrar",
					deleteMessage: "Se perderán todos los datos de la empresa. Los tickets abiertos de este usuario se moverán a la cola.",
				},
			},
			helps: {
				title: "Central de Ayuda",
			},
			schedules: {
				title: "Agendamientos",
				confirmationModal: {
					deleteTitle: "¿Está seguro de que desea eliminar este Agendamiento?",
					deleteMessage: "Esta acción no se puede revertir.",
				},
				table: {
					contact: "Contacto",
					body: "Mensaje",
					sendAt: "Fecha de Agendamiento",
					sentAt: "Fecha de Envío",
					status: "Estado",
					actions: "Acciones",
				},
				buttons: {
					add: "Nuevo Agendamiento",
				},
				toasts: {
					deleted: "Agendamento excluído com sucesso.",
				},
			},
			tags: {
				title: "Tags",
				confirmationModal: {
					deleteTitle: "¿Está seguro de que desea eliminar esta tag?",
					deleteMessage: "Esta acción no se puede revertir.",
				},
				table: {
					name: "Nombre",
					color: "Cor",
					tickets: "Registros Tagdos",
					actions: "Acciones",
				},
				buttons: {
					add: "Nueva Tag",
				},
				toasts: {
					deleted: "Tag excluída com sucesso.",
				},
			},
			ratings: {
				title: "Classificações",
				table: {
					name: "Nombre",
					contacts: "Contactos",
					actions: "Acciones",
				},
				toasts: {
					deleted: "Calificación eliminada con éxito.",
					deletedAll: "Todas las calificaciones eliminadas con éxito.",
				},
				buttons: {
					add: "Añadir Calificación",
					deleteAll: "Boorar Todas",
				},
				confirmationModal: {
					deleteTitle: "Boorar",
					deleteAllTitle: "Borar Todas",
					deleteMessage: "Ten cuidado, esta acción no se puede deshacer. ¿Estás seguro?",
					deleteAllMessage: "¿Está seguro de que desea eliminar todas las calificaciones?",
				},
			},
			settings: {
				success: "Configuración guardada con éxito.",
				title: "Configuraciones",
				settings: {
					userCreation: {
						name: "Crear usuarios",
						options: {
							enabled: "Activado",
							disabled: "Desactivado",
						},
					},
				},
			},
			messagesList: {
				header: {
					assignedTo: "Asignado a: ",
					dialogRatingTitle: "¿Quieres dejar una reseña de servicio al cliente?",
					dialogClosingTitle: "Finalizar Conversación con el Cliente",
					dialogRatingCancel: "Resolver con mensaje de despedida",
					dialogRatingSuccess: "Resolver y enviar Calificación",
					dialogRatingWithoutFarewellMsg: "Resolver sin mensaje de despedida",
					ratingTitle: "Elija un menú de Calificación",
					buttons: {
						return: "Devolver",
						resolve: "Resolver",
						reopen: "Reabrir",
						accept: "Aceptar",
						rating: "Enviar Calificación",
					},
				},
			},
			messagesInput: {
				placeholderOpen: "Escriba un mensaje",
				placeholderClosed: "Reabrir o aceptar este ticket para enviar un mensaje.",
				signMessage: "Firmar",
			},
			contactDrawer: {
				header: "Detalles de contacto",
				buttons: {
					edit: "Editar contato",
				},
				extraInfo: "Outras informações",
			},
			ticketOptionsMenu: {
				schedule: "Agendamiento",
				delete: "Borrar",
				transfer: "Transferir",
				registerAppointment: "Notas de contacto",
				resolveWithNoFarewell: "Final sin despedida",
				acceptAudioMessage: "¿Aceptar audio del contacto?",
				appointmentsModal: {
					title: "Notas de contacto",
					textarea: "Observación",
					placeholder: "Ingresa los datos que deseas registrar aquí",
				},
				confirmationModal: {
					title: "Eliminar conversación de contacto",
					message: "¡Atención! Todos los mensajes relacionados con el ticket se perderán.",
				},
				buttons: {
					delete: "Borrar",
					cancel: "Cancelar",
				},
			},
			confirmationModal: {
				buttons: {
					confirm: "Ok",
					cancel: "Cancelar",
				},
			},
			messageOptionsMenu: {
				delete: "Borrar",
				reply: "Responder",
				forward: "Reenviar",
				toForward: "Reenviar",
				talkTo: "Hablar con",
				confirmationModal: {
					title: "¿Borrar mensaje?",
					message: "Esta acción no se puede revertir.",
				},
			},
			backendErrors: {
				ERR_NO_OTHER_WHATSAPP: "Debe haber al menos un WhatsApp predeterminado.",
				ERR_NO_DEF_WAPP_FOUND: "No se encontró WhatsApp predeterminado. Revisa la página de conexiones.",
				ERR_WAPP_NOT_INITIALIZED: "Esta sesión de WhatsApp no ​​se ha inicializado. Revisa la página de conexiones.",
				ERR_WAPP_CHECK_CONTACT: "No se puede verificar el contacto de WhatsApp. Revisa la página de conexiones",
				ERR_WAPP_INVALID_CONTACT: "Este no es un número de whatsapp válido.",
				ERR_WAPP_DOWNLOAD_MEDIA: "No se pueden descargar medios de WhatsApp. Consulte la página de conexiones.",
				ERR_INVALID_CREDENTIALS: "Error de autenticación. Inténtalo de nuevo.",
				ERR_SENDING_WAPP_MSG: "Error al enviar mensaje de WhatsApp. Revisa la página de conexiones.",
				ERR_DELETE_WAPP_MSG: "No se puede eliminar el mensaje de WhatsApp.",
				ERR_OTHER_OPEN_TICKET: "Ya hay un conversación abierto para este contacto.",
				ERR_SESSION_EXPIRED: "Sesión expirada. Por favor entre.",
				ERR_USER_CREATION_DISABLED: "El administrador ha inhabilitado la creación de usuarios.",
				ERR_NO_PERMISSION: "No tienes permiso para acceder a este recurso..",
				ERR_DUPLICATED_CONTACT: "Ya existe un contacto con este número.",
				ERR_NO_SETTING_FOUND: "No se encontró ninguna configuración con este ID.",
				ERR_NO_CONTACT_FOUND: "No se encontró ningún contacto con este ID.",
				ERR_NO_TICKET_FOUND: "No se encontraron conversación con esta ID.",
				ERR_NO_USER_FOUND: "No se encontró ningún usuario con este ID.",
				ERR_NO_WAPP_FOUND: "No se encontró WhatsApp con este ID.",
				ERR_CREATING_MESSAGE: "Error al crear mensaje en la base de datos.",
				ERR_CREATING_TICKET: "Error al crear ticket en la base de datos.",
				ERR_FETCH_WAPP_MSG: "Error al buscar el mensaje en WhatsApp, tal vez sea demasiado antiguo.",
				ERR_QUEUE_COLOR_ALREADY_EXISTS: "Este color ya está en uso, elija otro.",
				ERR_WAPP_GREETING_REQUIRED: "El mensaje de saludo es obligatorio cuando hay más de una fila.",
				ERR_OUT_OF_HOURS: "¡Fuera del horario de oficina!",
			},
		},
	},
};

export { messages };
