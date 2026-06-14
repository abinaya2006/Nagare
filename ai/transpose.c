#include<stdio.h>
void main()
{
    int m,n;
    printf("rows and columns:\n");
    scanf("%d%d",&m,&n);
    int a[m][n],at[n][m];
    int ma[m][m],s=0;

    
    printf("Enter the elements of matrix A:\n");
    for (int i=0;i<m;i++){
        for(int j=0;j<n;j++)
            scanf("%d",&a[i][j]);
    }

    printf("The Entered matrix:\n");
    for (int i=0;i<m;i++){
        for(int j=0;j<n;j++)
            printf("%d ",a[i][j]);
        
        printf("\n");
    }

    
    for (int i=0;i<m;i++){
        for(int j=0;j<n;j++)
        {
            at[j][i]=a[i][j];
        }   
    }

    printf("The Transpose matrix:\n");
    for (int i=0;i<n;i++){
        for(int j=0;j<m;j++)
            printf("%d ",at[i][j]);
        
        printf("\n");
    }
    
    for (int i=0;i<m;i++)
    {   
        for(int j=0;j<m;j++){
            s=0;
            for (int k=0;k<n;k++){
                s+=a[i][k]*at[k][j];
            }
            ma[i][j]=s;
        }
    }

    
        
    printf("\nA*A^T:\n");
    for (int i=0;i<m;i++)
    {
        for(int j=0;j<m;j++)
        {
            printf("%d ",ma[i][j]);
            
        }
        
        printf("\n");
    }
    int isOrtho=1;

    for (int i=0;i<m;i++)
    {
        for(int j=0;j<m;j++)
        {
           if((i==j && ma[i][j]!=1) || (i!=j && ma[i][j]!=0))
           {
            isOrtho=0;
            break;
           }
        }
    }
    
    isOrtho?printf("A*A^T=I \nA is orthogonal"):printf("A*A^T!=I\nA is not orthogonal");
}

