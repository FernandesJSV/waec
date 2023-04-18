import React from "react";

import {
	Box,
	Typography,
	Container,
	Link
} from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";

const Copyright = () => {
	return (
		<Typography variant="body2" color="textSecondary" align="center">
			© {new Date().getFullYear()}
			{" - "}
			<Link color="inherit" href="https://infobyte.tec.br">
				Infobyte.tec.br
			</Link>
			{"."}
		</Typography>
	);
};

const useStyles = makeStyles(theme => ({
	paper: {
		marginTop: theme.spacing(10),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%",
		marginTop: theme.spacing(3),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
	logo: {
		logo: theme.logo
	}
}));

const SignUp = () => {
	const classes = useStyles();

	return (
		<Container component="main">
			<div className={classes.paper}>
				<h1>Cadastro de usuário desativado!</h1>
				<br></br>
				<br></br>
				<h3>Favor, falar com o administrador do sistema!</h3>
				<br></br>
				<br></br>
				<Link
					target="_blank"
					rel="noopener"
					href="https://wa.me/5519989639009"
				>
					Contato Administrador
				</Link>
			</div>
			{/* <Box mt={5}>{<Copyright />}</Box> */}
		</Container>
	);
};

export default SignUp;
