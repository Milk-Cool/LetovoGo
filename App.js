import "react-native-gesture-handler";
import { useState, useRef, useEffect } from "react";
import { StyleSheet, Text, View,
  TextInput, Pressable, Alert, ScrollView,
  TouchableHighlight, Linking, Platform,
  Switch, 
  Button} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Letovo from "letovo-api";
import { Link, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { createStackNavigator } from "@react-navigation/stack";
import * as Application from "expo-application";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  })
});

const ACCENT_COLOR = "#88f";
const RED_ACCENT_COLOR = "#f88";
const SECONDARY_COLOR = "#888";
const BUTTON_TEXT_COLOR = "#fff";
const NOTIFICATION_COLOR = "#8888ff";

let loggedIn = false;

let user = null;

const InputField = props => <TextInput
  style={styles.text_field}
  placeholder={props.placeholder}
  onChangeText={props.onChangeText}
  secureTextEntry={props.isPassword}
  autoComplete={props.autoComplete}
/>

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const text = {
  "ru": {
    "monday": "Понедельник",
    "tuesday": "Вторник",
    "wednesday": "Среда",
    "thursday": "Четверг",
    "friday": "Пятница",
    "saturday": "Суббота",
    "sunday": "Воскресенье",
    "avg_formative": "Среднее формативов: ",
    "avg_summative": "Среднее саммативов: ",
    "avg_final": "Среднее итоговых: ",
    "bronze": "Бронзовые",
    "silver": "Серебряные",
    "golden": "Золотые",
    "enter_username": "Вы не ввели имя пользователя!",
    "enter_username_2": "Введите своё школьное имя пользователя.",
    "enter_password": "Вы не ввели пароль!",
    "enter_password_2": "Введите свой школьный пароль.",
    "error": "Ошибка",
    "err_schedule": "Расписание",
    "err_plan": "Учебный план",
    "err_hw_this": "Д/з на эту неделю",
    "err_hw_next": "Д/з на следующую неделю",
    "err_marks": "Оценки",
    "err_diploma_sport": "Диплом: Спорт и здоровье",
    "err_diploma_creativity": "Диплом: Творчество и изобретательство",
    "err_diploma_responsibility": "Диплом: Социальная и гражданская ответственность",
    "err_diploma_science": "Диплом: Наука и познание",
    "err_diploma_leadership": "Диплом: Лидерство и взаимодействие",
    "err_olympiads": "Олимпиады",
    "login_success": "Успех!",
    "login_success_2": "Вы успешно вошли в свой аккаунт.",
    "login_fail": "Неверный логин/пароль!",
    "login_fail_2": "Пожалуйста, введите правильные логин и пароль.",
    "uname": "Имя пользователя",
    "pwd": "Пароль",
    "log_in": "Войти",
    "logging_in": "Входим...",
    "log_out": "Выйти",
    "log_out_info": "Если вы выйдете, то ваши логин и пароль будут удалены с устройства, и вы не сможете входить автоматически. Также вы не сможете получать уведомления.",
    "this_week": "Эта неделя",
    "next_week": "Следующая неделя",
    "made_by": "Сделано Milk_Cool с ❤️",
    "link": "Ссылка",
    "no_link": "Ссылки нет",
    "s_log_out": "Выход",
    "s_log_in": "Вход",
    "s_schedule": "Расписание",
    "s_marks": "Оценки",
    "s_homework": "Домашка",
    "s_other": "Другое",
    "s_other_options": "Другие опции",
    "s_groups": "Группы",
    "s_diploma": "Диплом Летово",
    "s_olympiads": "Олимпиады",
    "s_settings": "Настройки",
    "s_info": "Информация",
    "language": "Язык",
    "diploma_sport": "Спорт и здоровье",
    "diploma_creativity": "Творчество и изобретательство",
    "diploma_responsibility": "Социальная и гражданская ответственность",
    "diploma_science": "Наука и познание",
    "diploma_leadership": "Лидерство и взаимодействие",
    "notification_error_physical": "Нужно использовать настоящее устройство, чтобы получать уведомления.",
    "notification_error_token": "Не получилось получить токен для уведомлений!",
    "notification": "Уведомления",
    "notification_disable": "Выключить уведомления",
    "notification_enable": "Включить уведомления",
  },
  "en": {
    "monday": "Monday",
    "tuesday": "Tuesday",
    "wednesday": "Wednesday",
    "thursday": "Thursday",
    "friday": "Friday",
    "saturday": "Saturday",
    "sunday": "Sunday",
    "avg_formative": "Formatives average: ",
    "avg_summative": "Summatives average: ",
    "avg_final": "Finals average: ",
    "bronze": "Bronze",
    "silver": "Silver",
    "golden": "Golden",
    "enter_username": "You did not enter a username!",
    "enter_username_2": "Please enter your school username.",
    "enter_password": "You did not enter a password!",
    "enter_password_2": "Please enter your school password.",
    "error": "Error",
    "err_schedule": "Schedule",
    "err_plan": "Plan",
    "err_hw_this": "Homework this week",
    "err_hw_next": "Homework next week",
    "err_marks": "Marks",
    "err_diploma_sport": "Diploma: Sport",
    "err_diploma_creativity": "Diploma: Creativity",
    "err_diploma_responsibility": "Diploma: Responsibility",
    "err_diploma_science": "Diploma: Science",
    "err_diploma_leadership": "Diploma: Leadership",
    "err_olympiads": "Olympiads",
    "login_success": "Success!",
    "login_success_2": "You have successfully logged in.",
    "login_fail": "Wrong username/password!",
    "login_fail_2": "Please enter a valid username/password pair.",
    "uname": "Username",
    "pwd": "Password",
    "log_in": "Log in",
    "logging_in": "Logging in...",
    "log_out": "Log out",
    "log_out_info": "Logging out will delete your login credentials from your device and you will not be able to log in automatically. You will also not be able to recieve notifications.",
    "this_week": "This week",
    "next_week": "Next week",
    "made_by": "Made by Milk_Cool with ❤️",
    "link": "Link",
    "no_link": "No link",
    "s_log_out": "Log out",
    "s_log_in": "Log in",
    "s_schedule": "Schedule",
    "s_marks": "Marks",
    "s_homework": "Homework",
    "s_other": "Other",
    "s_other_options": "Other options",
    "s_groups": "Groups",
    "s_diploma": "Letovo Diploma",
    "s_olympiads": "Olympiads",
    "s_settings": "Settings",
    "s_info": "Info",
    "language": "Language",
    "diploma_sport": "Sport",
    "diploma_creativity": "Creativity",
    "diploma_responsibility": "Responsibility",
    "diploma_science": "Science",
    "diploma_leadership": "Leadership",
    "notification_error_physical": "You need to use a physical device to recieve notifications.",
    "notification_error_token": "Failed to get push token for push notification!",
    "notification": "Notifications",
    "notification_disable": "Disable notifications",
    "notification_enable": "Enable notifications",
  }
};

Date.prototype.getDayMon = function(){
  return [6, 0, 1, 2, 3, 4, 5][this.getDay()];
};

export default function App() {
  const todayDate = new Date();
  const today = todayDate.toISOString().split("T")[0];
  let days = [];
  for(let i = 0; i < 7; i++)
    days.push((new Date(new Date() - (todayDate.getDayMon() - i) * 1000 * 60 * 60 * 24)).toISOString().split("T")[0]);

  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const registerNotificationsSchedule = async () => {
    let token;

    if(Platform.OS === "android")
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: NOTIFICATION_COLOR,
      });
    
    if(Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Alert.alert(clang["notification_error_token"]);
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId })).data;
      // console.log(token);
    } else Alert.alert(clang["notification_error_physical"]);

    return token;
  };

  useEffect(() => {
    registerNotificationsSchedule().then(setExpoPushToken);

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const [schedule, setSchedule] = useState([]);
  const [selDay, setSelDay] = useState(today);
  const [selWeek, setSelWeek] = useState("this");
  const [plan, setPlan] = useState({});
  const [homework, setHomework] = useState([]);
  const [homework2, setHomework2] = useState([]);
  const [marks, setMarks] = useState([]);
  const [diplomaSport, setDiplomaSport] = useState([]);
  const [diplomaCreativity, setDiplomaCreativity] = useState([]);
  const [diplomaResponsibility, setDiplomaResponsibility] = useState([]);
  const [diplomaScience, setDiplomaScience] = useState([]);
  const [diplomaLeadership, setDiplomaLeadership] = useState([]);
  const [olympiads, setOlympiads] = useState([]);
  const [loggedIn_, setLoggedIn_] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [lang, setLang] = useState("en");
  const [clang, setClang] = useState(text["en"]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsToggled, setNotificationsToggled] = useState(false);

  const toggleNotifications = state => {
    setNotificationsToggled(true);
    setNotificationsEnabled(state);
  }

  useEffect(() => {
    if(!notificationsToggled) return () => null;
    AsyncStorage.setItem("notifications", notificationsEnabled ? "yes" : "no");
    (async () => {
      if(notificationsEnabled) {
        if(schedule.length > 0) {
          for(let i of schedule) {
            if(i.schedules.length == 0) continue;
            let date = new Date(`${i.date} ${i.period_start}`);
            date = new Date(date - 5 * 60 * 1000);
            Notifications.scheduleNotificationAsync({
              content: {
                title: { "ru": i.schedules[0].group.subject.subject_name, "en": i.schedules[0].group.subject.subject_name_eng }[lang] + " " + i.schedules[0].room.room_name,
                body: `${i.period_shortname} ${i.period_name} ${i.period_start}`
              },
              trigger: {
                repeats: true,
                weekday: date.getDay() + 1,
                hour: date.getHours(),
                minute: date.getMinutes()
              }
            });
            console.log("Scheduled", { "ru": i.schedules[0].group.subject.subject_name, "en": i.schedules[0].group.subject.subject_name_eng }[lang] + " " + i.schedules[0].room.room_name, date)
          }
        }
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    })();
    return () => null;
  }, [notificationsEnabled, schedule]);

  (async () => {
    if(await AsyncStorage.getItem("lang") === null)
      await AsyncStorage.setItem("lang", "en");
    setLang(await AsyncStorage.getItem("lang"));
    setClang(text[lang]);

    console.log(await AsyncStorage.getItem("notifications"))
    if(await AsyncStorage.getItem("notifications") === null)
      await AsyncStorage.setItem("notifications", "no");
    setNotificationsEnabled(await AsyncStorage.getItem("notifications") == "yes");
  })();

  const setLanguage = async language => {
    setLang(language);
    setClang(text[language]);
    await AsyncStorage.setItem("lang", language);
  }
  
  const generateTable = () => {
    let col = [];
    for(let i of schedule) {
      if(i.date != selDay) continue;
      if(i.schedules.length != 0)
        col.push(
          <View>
            <Text style={{ fontWeight: "bold", ...styles.buttonText }}>{"(" + i.period_start + " - " + i.period_end + ") " + { "ru": i.schedules[0].group.subject.subject_name, "en": i.schedules[0].group.subject.subject_name_eng }[lang] + "\n"}</Text>
            <Text style={styles.buttonText}>{i.schedules[0].group.group_name + " " + i.schedules[0].room.room_name + "\n"}</Text>
            <Text style={{ fontSize: 8, ...styles.buttonText }}>{`${i.period_name} (${i.period_shortname})`}</Text>
          </View>
        );
    }
    return col;
  }
  const generatePlan = () => {
    if(typeof plan.student_curriculum === "undefined") return [];
    let col = [];
    for(let i of plan.student_curriculum) {
      col.push(
        <View>
          <Text style={{ fontWeight: "bold", ...styles.buttonText }}>{i.group.group_name + "\n"}</Text>
          <Text style={styles.buttonText}>{{ "ru": i.group.subject.subject_name, "en": i.group.subject.subject_name_eng }[lang] + "\n"}</Text>
          <Text style={{ fontSize: 8, ...styles.buttonText }}>{`${{ "ru": i.group.group_teachers[0].teacher.teacher_surname, "en": i.group.group_teachers[0].teacher.teacher_surname_eng }[lang]} ${{ "ru": i.group.group_teachers[0].teacher.teacher_name, "en": i.group.group_teachers[0].teacher.teacher_name_eng }[lang]} ${{ "ru": i.group.group_teachers[0].teacher.teacher_fath, "en": i.group.group_teachers[0].teacher.teacher_fath_eng }[lang]}`}</Text>
          <TouchableHighlight onPress={() => Linking.openURL("mailto:" + i.group.group_teachers[0].teacher.teacher_mail)}><Text style={{ fontSize: 8, textDecorationLine: "underline", ...styles.buttonText }}>{`${i.group.group_teachers[0].teacher.teacher_mail}`}</Text></TouchableHighlight>
        </View>
      );
    }
    return col;
  }
  const generateHomework = () => {
    let col = [];
    const hw = selWeek == "this" ? homework : homework2; 
    for(let i in hw)
      for(let j of hw[i]) {
        if(j.task == "") continue;
        col.push(
          <View>
            <Text style={{ fontWeight: "bold", ...styles.buttonText }}>{j.name + "\n"}</Text>
            <Text style={{ fontWeight: "bold", ...styles.buttonText }}>{[clang["monday"], clang["tuesday"], clang["wednesday"], clang["thursday"], clang["friday"], clang["saturday"], clang["sunday"]][i] + "\n"}</Text>
            <Text style={styles.buttonText}>{j.task}</Text>
            <Text>{j.link ? <TouchableHighlight onPress={() => Linking.openURL(j.link)}><Text style={{ ...styles.buttonText, textDecorationLine: "underline", fontSize: 30 }}>{clang["link"]}</Text></TouchableHighlight> : <Text style={styles.buttonText}>{clang["no_link"]}</Text>}</Text>
          </View>
        );
      }
    return col;
  }
  const generateMarks = () => {
    let col = [];
    for(let i of marks) {
      if(i.formative_list.length == 0 && i.summative_list.length == 0 && i.final_mark_list == 0) continue;
      col.push(
        <View>
          <Text style={{ fontSize: 25, ...styles.buttonText }}>{{ "ru": i.group.subject.subject_name, "en": i.group.subject.subject_name_eng }[lang]}</Text>
          <Text style={{ fontWeight: "bold", ...styles.buttonText }}>{clang["avg_summative"] + i.summative_avg_value}</Text>
          <Text style={{ fontWeight: "bold", ...styles.buttonText }}>{clang["avg_formative"] + i.formative_avg_value}</Text>
          <Text style={{ fontWeight: "bold", ...styles.buttonText }}>{clang["avg_final"] + i.result_final_mark}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>{ i.formative_list.map(x => <Pressable onPress={() => Alert.alert(x.lesson_thema, x.created_at)} style={styles.invertedSchedule_item}><Text style={styles.invertedButtonText}>{(x.mark_criterion ?? "F") + " " + x.mark_value}</Text></Pressable>) }</View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>{ i.summative_list.map(x => <Pressable onPress={() => Alert.alert(x.lesson_thema, x.created_at)} style={styles.invertedSchedule_item}><Text style={styles.invertedButtonText}>{(x.mark_criterion ?? "F") + " " + x.mark_value}</Text></Pressable>) }</View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>{ i.final_mark_list.map(x => <Pressable onPress={() => Alert.alert(x.lesson_thema, x.created_at)} style={styles.invertedSchedule_item}><Text style={styles.invertedButtonText}>{(x.mark_criterion ?? "F") + " " + x.mark_value}</Text></Pressable>) }</View>
        </View>
      );
    }
    return col;
  }
  const generateDiploma = () => {
    const mapType = x => ({ "Бронзовые": "B", "Серебряные": "S", "Золотые": "G" }[x.letovodiploma_criterion.diplom_level]);
    const mapF1 = x => <Pressable onPress={() => Alert.alert(x.student_activity.activity.activity_name ?? x.letovodiploma_criterion.diplom_criterion, x.student_activity.activity_time)} style={{ ...styles.invertedSchedule_item, "alignSelf": "stretch" }}><View style={{ flexDirection: "row", flex: 1 }}><Text style={{ flex: 1, ...styles.invertedButtonText }}>{x.student_activity.activity.activity_name ?? x.letovodiploma_criterion.diplom_criterion}</Text><Text style={{ flexShrink: 1, alignContent: "flex-end", ...styles.invertedButtonText }}>{x.result_score + mapType(x)}</Text></View></Pressable>;
    const mapF2 = x => <Pressable onPress={() => Alert.alert(x.student_course.group.group_name, x.student_course.group.year.year_start + "-" + x.student_course.group.year.year_end)} style={{ ...styles.invertedSchedule_item, "alignSelf": "stretch" }}><View style={{ flexDirection: "row", flex: 1 }}><Text style={{ flex: 1, ...styles.invertedButtonText }}>{x.student_course.group.group_name}</Text><Text style={{ flexShrink: 1, alignContent: "flex-end", ...styles.invertedButtonText }}>{x.result_score + mapType(x)}</Text></View></Pressable>;
    const mapF3 = x => <Pressable onPress={() => Alert.alert(x.student_olimpiada.olimpiada.olimp_name, x.student_olimpiada.olimpiada_result + " " + x.student_olimpiada.olimpiada.year.year_start + "-" + x.student_olimpiada.olimpiada.year.year_end)} style={{ ...styles.invertedSchedule_item, "alignSelf": "stretch" }}><View style={{ flexDirection: "row", flex: 1 }}><Text style={{ flex: 1, ...styles.invertedButtonText }}>{x.student_olimpiada.olimpiada.olimp_name}</Text><Text style={{ flexShrink: 1, alignContent: "flex-end", ...styles.invertedButtonText }}>{x.result_score + mapType(x)}</Text></View></Pressable>;
    const mapF4 = x => <View></View>;
    let col = [];
    for(let i in [0, 1, 2, 3, 4]) {
      const I = [diplomaSport, diplomaCreativity, diplomaResponsibility, diplomaScience, diplomaLeadership][i];
      col.push(
        <View>
          <Text style={{ ...styles.buttonText, fontSize: 25, fontWeight: "bold" }}>{clang["diploma_" + ["sport", "creativity", "responsibility", "science", "leadership"][i]]}</Text>
          {I.map(x => {
            switch(x.result_type) {
              case "activity":
                return mapF1(x);
              case "course":
                return mapF2(x);
              case "olimp":
                return mapF3(x);
              case "project":
                return mapF4(x);
            }
          })}
        </View>
      );
    }
    return col;
  }
  const generateOlympiads = () => {
    let col = [];
    for(let i of olympiads) {
      col.push(
        <Pressable onPress={() => Alert.alert(i.olimpiada.olimp_name, i.olimpiada_result + "\n" + { "ru": i.subject.subject_name, "en": i.subject.subject_name_eng }[lang] + "\n" + i.activity_results.map(x => x.letovodiploma_criterion.diplom_level + " " + x.letovodiploma_criterion.diplom_score).join("\n"))}>
          <Text style={{ ...styles.buttonText, fontWeight: "bold", fontSize: 25 }}>{i.olimpiada.olimp_name}</Text>
          <Text style={styles.buttonText}>{i.olimpiada.olimp_start + " - " + i.olimpiada.olimp_end}</Text>
        </Pressable>
      );
    }
    return col;
  }

  const err = (cause, error) => Alert.alert(clang[error] + ": " + cause, error);

  const LoginScreen = props => {
    const [uname, setUname] = useState("");
    const [pwd, setPwd] = useState("");

    const saveLoginPassword = async () => {
      await AsyncStorage.setItem("uname", uname);
      await AsyncStorage.setItem("pwd", pwd);
    }
    const loadLoginPassword = async () => {
      const loadedUname = await AsyncStorage.getItem("uname");
      const loadedPwd = await AsyncStorage.getItem("pwd");
      return [loadedUname, loadedPwd];
    }
    const checkLoginPassword = async () => {
      const [loadedUname, loadedPwd] = await loadLoginPassword();
      return loadedUname !== null && loadedPwd !== null && loadedUname !== "" && loadedPwd !== "";
    }
    const login = async (silent) => {
      setPwd(pwd.replace("@student.letovo.ru", "").replace("@letovo.ru", ""));
      if(await checkLoginPassword() && uname == "" && pwd == "") {
        user = new Letovo(...(await loadLoginPassword()));
      } else {
        if(uname == "")
          return Alert.alert(clang["enter_username"], clang["enter_username_2"]);
        if(pwd == "")
          return Alert.alert(clang["enter_password"], clang["enter_password_2"]);
        user = new Letovo(uname, pwd);
      }
      setLoggingIn(true);
      try {
        await user.login();
        await user.loginOld();
        await saveLoginPassword();
        if(!silent) Alert.alert(clang["login_success"], clang["login_success_2"]);
        user.weekSchedule().then(setSchedule).catch(e => err(clang["err_schedule"], e));
        user.plan().then(setPlan).catch(e => err(clang["err_plan"], e));
        user.homework().then(setHomework).catch(e => err(clang["err_hw_this"], e));
        user.homework(new Date(+(new Date()) + 1000 * 60 * 60 * 24 * 7)).then(setHomework2).catch(e => err(clang["err_hw_next"], e));
        user.marks().then(setMarks).catch(e => err(clang["err_marks"], e));
        user.diploma(1).then(setDiplomaSport).catch(e => err(clang["err_diploma_sport"], e));
        user.diploma(2).then(setDiplomaCreativity).catch(e => err(clang["err_diploma_creativity"], e));
        user.diploma(3).then(setDiplomaResponsibility).catch(e => err(clang["err_diploma_responsibility"], e));
        user.diploma(4).then(setDiplomaScience).catch(e => err(clang["err_diploma_science"], e));
        user.diploma(5).then(setDiplomaLeadership).catch(e => err(clang["err_diploma_leadership"], e));
        user.olympiads().then(setOlympiads).catch(e => err(clang["err_olympiads"], e));
        setLoggedIn_(true);
        setLoggingIn(false);
      } catch(_) {
        Alert.alert(clang["login_fail"], clang["login_fail_2"]);
        setLoggingIn(false);
      }
    }
    (async () => {
      if(!loggedIn && await checkLoginPassword()) {
        loggedIn = true;
        await login(true);
      }
    })();
    return (
      <View style={styles.container}>
        <InputField
          placeholder={clang["uname"]}
          onChangeText={setUname}
          autoComplete="username"
        />
        <InputField
          placeholder={clang["pwd"]}
          onChangeText={setPwd}
          isPassword={true}
          autoComplete="current-password"
        />
        <Pressable
          style={styles.button}
          onPress={() => loggingIn ? null : login(false)}
        >
          <Text style={styles.buttonText}>{loggingIn ? clang["logging_in"] : clang["log_in"]}</Text>
        </Pressable>
      </View>
    )
  };
  const LogoutScreen = () => {
    const logout = async () => {
      await AsyncStorage.setItem("uname", "");
      await AsyncStorage.setItem("pwd", "");
      setSchedule([]);
      setPlan({});
      setHomework([]);
      setHomework2([]);
      setMarks([]);
      setDiplomaSport([]);
      setDiplomaCreativity([]);
      setDiplomaResponsibility([]);
      setDiplomaScience([]);
      setDiplomaLeadership([]);
      setOlympiads([]);
      setLoggedIn_(false);
      user = null;
    }
    return (
      <View style={styles.container}>
        <Pressable
          style={{ ...styles.button, backgroundColor: RED_ACCENT_COLOR }}
          onPress={() => logout()}
        >
          <Text style={styles.buttonText}>{clang["log_out"]}</Text>
        </Pressable>
        <Text style={{ maxWidth: 300, textAlign: "center" }}>{clang["log_out_info"]}</Text>
      </View>
    );
  }

  const ScheduleList = ({ data }) => {
    const schd = data.map(x => <View style={styles.schedule_item}>
      {x}
    </View>);
    return <View>{schd}</View>;
  };

  const ScheduleScreen = () => {
    return (
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignContent: "center" }}>
        <Picker
          style={{ alignSelf: "stretch" }}
          selectedValue={selDay}
          onValueChange={setSelDay}
        >
          <Picker.Item label={clang["monday"]} value={days[0]} />
          <Picker.Item label={clang["tuesday"]} value={days[1]} />
          <Picker.Item label={clang["wednesday"]} value={days[2]} />
          <Picker.Item label={clang["thursday"]} value={days[3]} />
          <Picker.Item label={clang["friday"]} value={days[4]} />
          <Picker.Item label={clang["saturday"]} value={days[5]} />
          <Picker.Item label={clang["sunday"]} value={days[6]} />
        </Picker>
        <ScheduleList data={generateTable()} />
      </ScrollView>
    );
  };

  const GroupsScreen = () => {
    return (
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignContent: "center" }}>
        <ScheduleList data={generatePlan()} />
      </ScrollView>
    );
  };

  const HomeworkScreen = () => {
    return (
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignContent: "center" }}>
        <Picker
          style={{ alignSelf: "stretch" }}
          selectedValue={selWeek}
          onValueChange={setSelWeek}
        >
          <Picker.Item label={clang["this_week"]} value="this" />
          <Picker.Item label={clang["next_week"]} value="next" />
        </Picker>
        <ScheduleList data={generateHomework()} />
      </ScrollView>
    );
  }

  const MarksScreen = () => {
    return (
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignContent: "center" }}>
        <ScheduleList data={generateMarks()} />
      </ScrollView>
    );
  }
  
  const DiplomaScreen = () => {
    return (
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignContent: "center" }}>
        <ScheduleList data={generateDiploma()} />
      </ScrollView>
    );
  }

  const OlympiadsScreen = () => {
    return (
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignContent: "center" }}>
        <ScheduleList data={generateOlympiads()} />
      </ScrollView>
    )
  }
  
  const InfoScreen = () => {
    return (
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignContent: "center" }}>
        <Text style={{ fontSize: 25 }}>{Application.applicationName}</Text>
        <Text>{Application.nativeApplicationVersion}</Text>
        <Text>{Application.applicationId}</Text>
        <Text>{Application.nativeBuildVersion}</Text>
        <Text>{clang["made_by"]}</Text>
      </ScrollView>
    )
  }

  const OtherChooserScreen = ({ navigation }) => {
    const Option = params => {
      return <Pressable
        style={styles.option}
        onPress={() => navigation.navigate(params.screen)}
      >
        <Text style={styles.optionText}>{params.name}</Text>
        <Ionicons style={styles.optionArrow} name="chevron-forward-outline" size={22} />
      </Pressable>
    }
    return (
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignContent: "center" }}>
        <Option screen={clang["s_groups"]} name={clang["s_groups"]} />
        <Option screen={clang["s_diploma"]} name={clang["s_diploma"]} />
        <Option screen={clang["s_olympiads"]} name={clang["s_olympiads"]} />
        <Option screen={clang["s_settings"]} name={clang["s_settings"]} />
        <Option screen={clang["s_info"]} name={clang["s_info"]} />
      </ScrollView>
    )
  }

  const OtherScreen = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen name={clang["s_other_options"]} component={OtherChooserScreen} />
        <Stack.Screen name={clang["s_groups"]} component={GroupsScreen} />
        <Stack.Screen name={clang["s_diploma"]} component={DiplomaScreen} />
        <Stack.Screen name={clang["s_olympiads"]} component={OlympiadsScreen} />
        <Stack.Screen name={clang["s_settings"]} component={SettingsScreen} />
        <Stack.Screen name={clang["s_info"]} component={InfoScreen} />
      </Stack.Navigator>
    );
  }

  const SettingsScreen = () => {
    return (
      <View style={styles.container}>
        <Text>{clang["language"]}</Text>
        <Picker
          style={{ width: 250 }}
          selectedValue={lang}
          onValueChange={setLanguage}
        >
          <Picker.Item label="Русский" value="ru" />
          <Picker.Item label="English" value="en" />
        </Picker>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", maxWidth: 250 }}>
          <Text style={{ flex: 1, flexDirection: "row" }}>{clang["notification"]}</Text>
          <Switch
            trackColor={{ false: SECONDARY_COLOR, true: ACCENT_COLOR }}
            thumbColor={ notificationsEnabled ? ACCENT_COLOR : BUTTON_TEXT_COLOR }
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
          />
          {/*<Pressable
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{notificationsEnabled ? clang["notification_disable"] : clang["notification_enable"]}</Text>
          </Pressable>*/}
        </View>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === clang["s_log_in"]) {
              iconName = focused
                ? "log-in"
                : "log-in-outline";
            } else if (route.name === clang["s_log_out"]) {
              iconName = focused
                ? "log-out"
                : "log-out-outline";
            } else if (route.name === clang["s_schedule"]) {
              iconName = focused
                ? "time"
                : "time-outline";
            } else if (route.name === clang["s_marks"]) {
              iconName = focused
                ? "school"
                : "school-outline";
            } else if (route.name === clang["s_homework"]) {
              iconName = focused
                ? "document"
                : "document-outline";
            } else if (route.name === clang["s_other"]) {
              iconName = focused
                ? "ellipsis-horizontal"
                : "ellipsis-horizontal-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: ACCENT_COLOR,
          tabBarInactiveTintColor: SECONDARY_COLOR,
        })}>
        <Tab.Screen name={loggedIn_ ? clang["s_log_out"] : clang["s_log_in"]} component={loggedIn_ ? LogoutScreen : LoginScreen} />
        <Tab.Screen name={clang["s_schedule"]} component={ScheduleScreen} />
        <Tab.Screen name={clang["s_marks"]} component={MarksScreen} />
        <Tab.Screen name={clang["s_homework"]} component={HomeworkScreen} />
        <Tab.Screen name={clang["s_other"]} component={OtherScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
  /*{loggedIn_
    ? <Tab.Screen name="Log out" component={LogoutScreen} />
    : <Tab.Screen name="Log in" component={LoginScreen} />
  }*/
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text_field: {
    margin: 15,
    padding: 15,
    borderColor: ACCENT_COLOR,
    borderWidth: 3,
    borderRadius: 5,
    minWidth: 250,
  },
  button: {
    margin: 15,
    padding: 15,
    backgroundColor: ACCENT_COLOR,
    alignItems: "center",
    borderRadius: 5,
    minWidth: 250,
    elevation: 3,
  },
  buttonText: {
    color: BUTTON_TEXT_COLOR,
  },
  invertedSchedule_item: {
    margin: 15,
    padding: 15,
    backgroundColor: BUTTON_TEXT_COLOR,
    borderRadius: 5,
    alignSelf: "flex-start",
    elevation: 3,
  },
  invertedButtonText: {
    color: ACCENT_COLOR,
  },
  schedule_item: {
    margin: 15,
    padding: 15,
    backgroundColor: ACCENT_COLOR,
    borderRadius: 5,
    minWidth: 250,
    elevation: 3,
  },
  option: {
    padding: 15,
    borderBottomWidth: 1.5,
    borderBottomColor: SECONDARY_COLOR,
    flexDirection: "row",
  },
  optionText: {
    fontSize: 18,
    color: ACCENT_COLOR,
    flex: 1,
    justifyContent: "flex-start"
  },
  optionArrow: {
    color: ACCENT_COLOR,
    justifyContent: "flex-end"
  }
});