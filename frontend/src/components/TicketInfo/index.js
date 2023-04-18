import React, { useState, useEffect } from "react";
import { Avatar, CardHeader } from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
	userQueueStyle: {
		// position: "absolute",
		marginRight: 5,
		// left: 10,
		// bottom: 5,
		color: "#ffffff",
		// background: theme.palette.total,
		padding: "1px 5px",
		borderRadius: "3px",
		fontWeight: 'bold',
		fontSize: "0.8em",
		display: "inline-flex"
	},
}));

const TicketInfo = ({ contact, ticket, onClick }) => {
	const classes = useStyles();
	
	const { user } = ticket
	const [userName, setUserName] = useState('')
	const [contactName, setContactName] = useState('')

	useEffect(() => {
		if (contact) {
			setContactName(contact.name);
			if (document.body.offsetWidth < 600) {
				if (contact.name.length > 10) {
					const truncadName = contact.name.substring(0, 10) + '...';
					setContactName(truncadName);
				}
			}
		}

		if (user && contact) {
			setUserName(`${i18n.t("messagesList.header.assignedTo")} ${user.name}`);

			if (document.body.offsetWidth < 600) {
				setUserName(`${user.name}`);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<CardHeader
			onClick={onClick}
			style={{ cursor: "pointer" }}
			titleTypographyProps={{ noWrap: true }}
			subheaderTypographyProps={{ noWrap: true }}
			avatar={
				<Avatar
					src={contact.profilePicUrl}
					alt="contact_image"
					style={{
						width: "50px",
						height: "50px",
						borderRadius: "20%"
					}}
				/>}
			title={`${contactName} #${ticket.id}`}
			subheader={ticket.user && `${userName} ${ticket.queue ? ' | Setor: ' + ticket.queue.name : ' | Setor: Nenhum'}`}
		/>
	);
};

export default TicketInfo;
