import React, { useEffect, useState } from 'react';
import '../Styles/menu.css'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { _setCache } from '../Services/Helper/common';
export default function Menu() {
	const history = useHistory();
	const handleChangePassword = (event) => {
		event.preventDefault();
		history.push('/changePassword')
	}
	const handleLogout = (event) => {
		event.preventDefault();
		_setCache('token', '');
		window.location.reload();
	}
	return (
		<>
			<input hidden className="nav__input_check" type="checkbox" id="checkmenu" />
			<label htmlFor="checkmenu" className="layout__menu" />

			<div id="nav" className="show___menu">
				<label htmlFor="checkmenu" className="close__menu">
					<i className="fas fa-ellipsis-v" />
				</label>
				<div className="main__menu_show">
					<div className="items__menu_auth" onClick={(e) => handleChangePassword(e)}>
						<a href="#"><i className="fas fa-cog"/> Đổi mật khẩu</a>
					</div>

					<div className="items__menu_auth" onClick={(e) => handleLogout(e)}>
						<a href="#"><i className="fas fa-sign-out-alt"/> Đăng xuất</a>
					</div>
				</div>
			</div>
		</>
	);
}