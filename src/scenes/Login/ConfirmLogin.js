import React, { Component } from 'react'
import { ActivityIndicator, Image, KeyboardAvoidingView } from 'react-native'
import { Auth } from 'aws-amplify'
import Toast from 'react-native-easy-toast'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { StackActions, NavigationActions } from 'react-navigation'

import { Colors, Spacing } from '../../components/DesignSystem'
import * as Utils from '../../components/Utils'
import ButtonGradient from '../../components/ButtonGradient'
import Client from '../../services/client'

class ConfirmLogin extends Component {
  state = {
    totpCode: null,
    user: {},
    code: null,
    confirmError: null,
    loadingConfirm: false,
    loadingData: true,
    userPublicKey: null
  }

  componentDidMount () {
    this.loadUserData()
  }

  loadUserData = async () => {
    try {
      // const userPubliKey = await Client.getPublicKey()
      const user = this.props.navigation.getParam('user')
      let totpCode = null
      if (user.challengeParam.MFAS_CAN_SETUP) {
        totpCode = await Auth.setupTOTP(user)
      }
      this.setState({ user, totpCode })
    } catch (error) {
      this.setState({ confirmError: error.message })
    }
  }

  goBackLogin = () => this.props.navigation.navigate('Login')

  changeInput = (text, field) => {
    this.setState({
      [field]: text,
      confirmError: null
    })
  }

  // confirmPublicKey = async () => {
  //   const { userPublicKey } = this.state
  //   const { navigation } = this.props
  //   this.setState({ loadingConfirm: true })
  //   try {
  //     if (!isAddressValid(userPublicKey)) throw new Error('Address invalid')
  //     await Client.setUserPk(userPublicKey)
  //     this.setState({ loadingConfirm: false }, () => navigation.navigate('App'))
  //   } catch (error) {
  //     this.setState({
  //       confirmError: error.message || error,
  //       loadingConfirm: false
  //     })
  //   }
  // }

  confirmLogin = async () => {
    const { totpCode, user, code } = this.state
    const { navigation } = this.props
    this.setState({ loadingConfirm: true, confirmError: null })
    try {
      totpCode
        ? await Auth.verifyTotpToken(user, code)
        : await Auth.confirmSignIn(user, code, 'SOFTWARE_TOKEN_MFA')

      const userPublicKey = await Client.getPublicKey()
      if (userPublicKey) {
        this.setState(
          {
            loadingConfirm: false,
            confirmError: null
          },
          () => {
            const signToAp = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: 'App' })],
              key: null
            })
            navigation.dispatch(signToAp)
          })
      } else {
        this.setState({ loadingConfirm: false }, () => {
          navigation.navigate('SetPublicKey')
        })
      }
    } catch (error) {
      let message = error.message

      if (error.code === 'NotAuthorizedException') {
        this.setState({ confirmError: message, loadingConfirm: false }, () => {
          navigation.navigate('Login', { totpError: true })
        })
        return
      }

      if (error.code === 'EnableSoftwareTokenMFAException') {
        message = 'Wrong code. Try set up your athenticator again with the code above'
      }

      this.setState({ confirmError: message, loadingConfirm: false })
    }
  }

  // showToast = success => {
  //   if (success) {
  //     this.refs.toast.show(
  //       'Google Authenticator secret copied to the clipboard'
  //     )
  //   }
  // }

  // renderTOTPArea = () => {
  //   const { totpCode } = this.state
  //   if (!totpCode) return null

  //   return (
  //     <React.Fragment>
  //       <Utils.Text size='xsmall'>
  //         For security reasons, you will need to link your account with Google
  //         Authenticator, please copy the code below to add to it. After add the
  //         code in your Google Authenticator, please copy the six digits code and
  //         paste it on the input above.
  //       </Utils.Text>
  //       <Utils.VerticalSpacer size='medium' />
  //       <Utils.Text size='xsmall' secondary>
  //         COPY THE CODE TO ADD TO YOUR GOOGLE AUTHENTICATOR
  //       </Utils.Text>
  //       <CopyInput
  //         value={totpCode}
  //         editable={false}
  //         onCopyText={this.showToast}
  //       />
  //       <Utils.VerticalSpacer size='small' />
  //     </React.Fragment>
  //   )
  // }

  render () {
    const { confirmError, loadingConfirm } = this.state
    return (
      <KeyboardAvoidingView
        // behavior='padding'
        // keyboardVerticalOffset={150}
        style={{ flex: 1, backgroundColor: Colors.background }}
        enabled
      >
        <KeyboardAwareScrollView>
          <Utils.StatusBar />
          <Utils.Container>
            <Utils.Content height={80} justify='center' align='center'>
              <Image source={require('../../assets/login-circle.png')} />
            </Utils.Content>
            <Utils.Content>
              <Utils.Text size='xsmall' secondary>
                PASTE GOOGLE AUTHENTICATOR CODE HERE
              </Utils.Text>
              <Utils.FormInput
                padding={Spacing.small}
                underlineColorAndroid='transparent'
                onSubmitEditing={this.confirmLogin}
                onChangeText={text => this.changeInput(text, 'code')}
              />
              {loadingConfirm ? (
                <Utils.Content height={80} justify='center' align='center'>
                  <ActivityIndicator size='small' color={Colors.yellow} />
                </Utils.Content>)
                : (<ButtonGradient text='CONFIRM LOGIN' onPress={this.confirmLogin} size='medium' />)
              }
            </Utils.Content>
            <Utils.Error>{confirmError}</Utils.Error>
            <Utils.Content justify='center' align='center'>
              <Utils.Text
                size='small'
                font='light'
                secondary
                onPress={this.goBackLogin}
              >
                Back to Login
              </Utils.Text>
            </Utils.Content>
            <Toast
              ref='toast'
              position='center'
              fadeInDuration={750}
              fadeOutDuration={1000}
              opacity={0.8}
            />
          </Utils.Container>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    )
  }
}

export default ConfirmLogin
