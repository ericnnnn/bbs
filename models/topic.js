module.exports=function (sequelize,DataTypes) {
  return sequelize.define('topic',{
    title:{
      type:DataTypes.STRING,
      allowNull:false
    },
    content:{
      type:DataTypes.STRING,
      allowNull:false
    }
  });
};
